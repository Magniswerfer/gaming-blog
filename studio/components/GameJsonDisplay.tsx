import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import { InputProps, PatchEvent, set, unset, useFormValue } from "sanity";
import { IgdbStore } from "./GameSelector.tsx";
import debounce from "lodash.debounce";

// IGDB API endpoint
// For development, use the localhost URL directly
const isDevelopment = typeof window !== "undefined" &&
  globalThis.location.hostname.includes("localhost");
const IGDB_API_URL = isDevelopment
  ? "http://localhost:8001/api/igdb/games"
  : "https://critico.deno.dev/api/igdb/games";
// In production, uncomment and use your deployed URL:
// const IGDB_API_URL = "https://your-production-domain.com/api/igdb";

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  summary?: string;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ name: string }>;
  involved_companies?: Array<{
    company: { name: string };
    developer: boolean;
    publisher: boolean;
  }>;
  screenshots?: Array<{ url: string }>;
}

// Fix image URL handling to prevent React errors
const getImageUrl = (url: string) => {
  if (!url) return "";
  // Make sure URL is absolute
  const fullUrl = url.startsWith("//") ? `https:${url}` : url;
  // Replace thumb with cover_big
  return fullUrl.replace("t_thumb", "t_cover_big");
};

// Format date from timestamp
const formatReleaseDate = (timestamp?: number) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp * 1000).getFullYear().toString();
};

const GameJsonDisplay = (props: InputProps) => {
  const { onChange, value: jsonString, readOnly } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Game search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Parse the JSON string to an object
  const jsonData = React.useMemo(() => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString as string);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null;
    }
  }, [jsonString]);

  // Get the title from the form
  const title = useFormValue(["title"]) as string;

  // Set title from JSON if available
  useEffect(() => {
    if (jsonData?.name && !title) {
      // Update the title field with the game name
      // Note: This would need a more complex solution to actually update the field
      console.log(
        "Game name available but title is empty:",
        jsonData.name,
      );
    }
  }, [jsonData, title]);

  // Get the game ID from the JSON data if available
  const gameId = jsonData?._igdb_id;

  // Debounced search function
  const searchGames = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) return;

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(IGDB_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            query:
              `fields name,cover.url,first_release_date,id; search "${term}"; limit 5;`,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to search for game: ${await response.text()}`,
          );
        }

        const games = await response.json();
        setSearchResults(games);
        setShowResults(true);
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error occurred";

        setError(`Search error: ${errorMessage}`);
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [],
  );

  // Function to fetch detailed game data
  const fetchGameDetails = async (id: number): Promise<any> => {
    try {
      const response = await fetch(IGDB_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          expanded: true,
          query: `
            fields name, summary, first_release_date, cover.url,
            involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
            platforms.name, genres.name, screenshots.url, similar_games.name;
            where id = ${id};
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch game details: ${await response.text()}`,
        );
      }

      const games = await response.json();
      if (games.length === 0) {
        return null;
      }

      return games[0];
    } catch (error) {
      console.error("Error fetching game details:", error);
      throw error;
    }
  };

  // Function to show a toast message safely
  const showToast = useCallback(
    (
      status: "success" | "error" | "warning" | "info",
      title: string,
      description?: string,
    ) => {
      // Use setTimeout to avoid ref issues with toast component
      setTimeout(() => {
        toast.push({
          status,
          title,
          description,
        });
      }, 0);
    },
    [toast],
  );

  // Handle game selection from search results
  const handleGameSelect = useCallback(async (selectedGame: Game) => {
    setIsLoading(true);
    setError(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);

    try {
      // Fetch detailed game data
      const gameData = await fetchGameDetails(selectedGame.id);
      if (!gameData) {
        throw new Error("Failed to fetch detailed game data");
      }

      // Include the gameId in the JSON data
      const enrichedData = {
        ...gameData,
        _igdb_id: selectedGame.id,
      };

      // Convert to string for storage
      const jsonString = JSON.stringify(enrichedData, null, 2);

      // Set the JSON data as a string
      onChange(set(jsonString));

      // Store the game ID for future reference
      IgdbStore.setSelectedGame(selectedGame.id, selectedGame.name);

      showToast(
        "success",
        "Game selected",
        `"${selectedGame.name}" data has been loaded`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";

      setError(errorMessage);
      showToast("error", "Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, showToast]);

  // Handle input change for search - using string parameter directly
  const handleInputChange = (event: any) => {
    // Safely get the value from the event target
    const newValue = event && event.target ? event.target.value || "" : "";

    setSearchTerm(newValue);

    if (newValue.length > 2) {
      searchGames(newValue);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Function to fetch and set game data using the title
  const fetchAndSetGameData = useCallback(async () => {
    if (!title && !searchTerm) {
      showToast("warning", "No title", "Please enter a game title first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use existing game ID if available
      let gameIdToUse = gameId;

      // If no game ID, search for the game
      if (!gameIdToUse) {
        const searchResponse = await fetch(IGDB_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            query: `fields id,name; search "${title || searchTerm}"; limit 1;`,
          }),
        });

        if (!searchResponse.ok) {
          throw new Error(
            `Failed to search for game: ${await searchResponse
              .text()}`,
          );
        }

        const searchResults = await searchResponse.json();
        if (!searchResults || searchResults.length === 0) {
          throw new Error(
            `No game found matching "${title || searchTerm}"`,
          );
        }

        gameIdToUse = searchResults[0].id;
      }

      // Fetch detailed game data
      const gameData = await fetchGameDetails(gameIdToUse);
      if (!gameData) {
        throw new Error("Failed to fetch detailed game data");
      }

      // Include the gameId in the JSON data
      const enrichedData = {
        ...gameData,
        _igdb_id: gameIdToUse, // Store ID inside the JSON for easier access
      };

      // Convert to string for storage
      const jsonString = JSON.stringify(enrichedData, null, 2);

      // Set the JSON data as a string
      onChange(set(jsonString));

      // Store the game ID for future reference
      IgdbStore.setSelectedGame(gameIdToUse, gameData.name);

      showToast(
        "success",
        "Data fetched",
        `Game data for "${gameData.name}" has been loaded`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error occurred";

      setError(errorMessage);
      showToast("error", "Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [title, searchTerm, gameId, onChange, showToast]);

  // Function to clear the data
  const handleClear = () => {
    onChange(unset());
    IgdbStore.resetSelectedGame();
    showToast("info", "Data cleared", "The game data has been removed");
  };

  // Format the JSON display
  const formatJsonDisplay = (data: any) => {
    if (!data) return null;

    // Create a more user-friendly display of the data with simpler layout
    return (
      <Stack space={3}>
        {/* Game cover image */}
        {data.cover?.url && (
          <Box marginBottom={3}>
            <img
              src={getImageUrl(data.cover.url)}
              alt={data.name}
              style={{
                width: "150px",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                display: "block",
              }}
            />
          </Box>
        )}

        {/* Title and release year */}
        <Box marginBottom={3}>
          <Text
            weight="semibold"
            size={3}
            style={{ display: "block", marginBottom: "14px" }}
          >
            {data.name}
          </Text>

          {data.first_release_date && (
            <Text size={2} muted style={{ display: "block" }}>
              Released: {new Date(data.first_release_date * 1000)
                .getFullYear()}
            </Text>
          )}
        </Box>

        {/* Developer and Publisher */}
        {data.involved_companies && (
          <Card padding={3} radius={2} marginBottom={3}>
            <Stack space={3}>
              {/* Developer */}
              {data.involved_companies.some((company: any) =>
                company.developer
              ) && (
                <Box>
                  <Text
                    weight="semibold"
                    size={1}
                    style={{
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Developer
                  </Text>
                  <Text size={1}>
                    {data.involved_companies
                      .filter((company: any) => company.developer)
                      .map((company: any) =>
                        company.company.name
                      )
                      .join(", ")}
                  </Text>
                </Box>
              )}

              {/* Publisher */}
              {data.involved_companies.some((company: any) =>
                company.publisher
              ) && (
                <Box>
                  <Text
                    weight="semibold"
                    size={1}
                    style={{
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Publisher
                  </Text>
                  <Text size={1}>
                    {data.involved_companies
                      .filter((company: any) => company.publisher)
                      .map((company: any) =>
                        company.company.name
                      )
                      .join(", ")}
                  </Text>
                </Box>
              )}
            </Stack>
          </Card>
        )}

        {/* Summary */}
        {data.summary && (
          <Card padding={3} radius={2} marginBottom={3}>
            <Text
              weight="semibold"
              size={1}
              style={{ display: "block", marginBottom: "10px" }}
            >
              Summary
            </Text>
            <Text
              size={1}
              style={{ lineHeight: "1.6", display: "block" }}
            >
              {data.summary}
            </Text>
          </Card>
        )}

        {/* Genres */}
        {data.genres && data.genres.length > 0 && (
          <Card padding={3} radius={2} marginBottom={3}>
            <Text
              weight="semibold"
              size={1}
              style={{ display: "block", marginBottom: "8px" }}
            >
              Genres
            </Text>
            <Text size={1}>
              {data.genres.map((genre: any) =>
                genre.name
              ).join(", ")}
            </Text>
          </Card>
        )}

        {/* Platforms */}
        {data.platforms && data.platforms.length > 0 && (
          <Card padding={3} radius={2} marginBottom={3}>
            <Text
              weight="semibold"
              size={1}
              style={{ display: "block", marginBottom: "8px" }}
            >
              Platforms
            </Text>
            <Text size={1}>
              {data.platforms.map((platform: any) =>
                platform.name
              ).join(", ")}
            </Text>
          </Card>
        )}

        {/* IGDB ID */}
        {data._igdb_id && (
          <Text
            size={0}
            muted
            style={{ display: "block", marginBottom: "8px" }}
          >
            IGDB ID: {data._igdb_id}
          </Text>
        )}

        {/* Note */}
        <Card padding={3} tone="caution" radius={2}>
          <Text size={0}>
            This data is stored as read-only JSON. Edit the title field to
            search for a different game.
          </Text>
        </Card>
      </Stack>
    );
  };

  // Render game search dropdown
  const renderGameSearchDropdown = () => {
    return (
      <>
        <Box marginBottom={3} style={{ position: "relative" }}>
          <TextInput
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for a game..."
            disabled={readOnly || isLoading}
            onFocus={() => {
              if (
                searchTerm.length > 2 &&
                searchResults.length > 0
              ) {
                setShowResults(true);
              }
            }}
            onBlur={() => {
              // Delay hiding results to allow for selection
              setTimeout(() => setShowResults(false), 200);
            }}
          />

          {isSearching && (
            <Box
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Spinner muted />
            </Box>
          )}

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <Card
              padding={1}
              shadow={1}
              radius={2}
              style={{
                position: "absolute",
                zIndex: 100,
                width: "100%",
                maxHeight: "300px",
                overflowY: "auto",
                backgroundColor: "white",
              }}
            >
              <Stack space={1}>
                {searchResults.map((game) => (
                  <Card
                    key={game.id}
                    padding={3}
                    radius={2}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleGameSelect(game)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur event from firing
                    tone="default"
                    as="button"
                  >
                    <Flex align="center" gap={3}>
                      {game.cover?.url && (
                        <img
                          src={getImageUrl(
                            game.cover.url,
                          )}
                          alt={game.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "2px",
                          }}
                        />
                      )}
                      <Box flex={1}>
                        <Text weight="semibold">
                          {game.name}
                        </Text>
                        <Text size={1} muted>
                          {formatReleaseDate(
                            game.first_release_date,
                          )}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                ))}
              </Stack>
            </Card>
          )}

          {/* No results message */}
          {showResults && searchTerm.length > 2 &&
            searchResults.length === 0 && !isSearching && (
            <Card
              padding={3}
              tone="caution"
              style={{
                position: "absolute",
                zIndex: 100,
                width: "100%",
              }}
            >
              <Text size={1}>
                No games found matching "{searchTerm}"
              </Text>
            </Card>
          )}
        </Box>

        <Button
          fontSize={1}
          padding={2}
          mode="default"
          tone="primary"
          text={isLoading ? undefined : "Fetch Game Data"}
          onClick={fetchAndSetGameData}
          disabled={isLoading || readOnly || (!title && !searchTerm)}
          icon={isLoading ? <Spinner /> : undefined}
        />
      </>
    );
  };

  return (
    <Stack space={3}>
      {/* Game data display or fetch button */}
      {jsonData
        ? (
          <>
            {formatJsonDisplay(jsonData)}
            {!readOnly && (
              <Flex gap={2}>
                <Button
                  fontSize={1}
                  padding={2}
                  mode="ghost"
                  tone="primary"
                  text="Refresh Data"
                  onClick={fetchAndSetGameData}
                  disabled={isLoading}
                  icon={isLoading ? <Spinner /> : undefined}
                />
                <Button
                  fontSize={1}
                  padding={2}
                  mode="ghost"
                  tone="critical"
                  text="Clear Data"
                  onClick={handleClear}
                  disabled={isLoading || readOnly}
                />
              </Flex>
            )}
          </>
        )
        : (
          <>
            <Card
              padding={3}
              radius={2}
              shadow={1}
              marginBottom={3}
            >
              <Text style={{ marginBottom: "12px" }}>
                Search for a game to import data from IGDB
              </Text>
              {renderGameSearchDropdown()}
            </Card>

            {error && (
              <Card padding={3} tone="critical">
                <Text size={1}>{error}</Text>
              </Card>
            )}
          </>
        )}
    </Stack>
  );
};

export default GameJsonDisplay;
