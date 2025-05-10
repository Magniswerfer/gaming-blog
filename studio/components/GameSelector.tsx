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
} from "@sanity/ui";
import {
  set,
  StringInputProps,
  StringSchemaType,
  unset,
  useClient,
  useFormValue,
} from "sanity";
import debounce from "lodash.debounce";

// Type definitions for game data
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

// IGDB API endpoint
// For development, use the localhost URL directly
const IGDB_API_URL = "http://localhost:8000/api/igdb";
// In production, uncomment and use your deployed URL:
// const IGDB_API_URL = "https://your-production-domain.com/api/igdb";

// Store for game data that can be accessed by other components
export const IgdbStore = {
  selectedGameId: null as number | null,
  selectedGameTitle: null as string | null,

  setSelectedGame(id: number, title: string) {
    this.selectedGameId = id;
    this.selectedGameTitle = title;

    // Also store in localStorage as a fallback
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("igdb:selectedGameId", id.toString());
        localStorage.setItem("igdb:selectedGameTitle", title);
      }
    } catch (e) {
      console.error("Failed to store game data in localStorage:", e);
    }
  },

  resetSelectedGame() {
    this.selectedGameId = null;
    this.selectedGameTitle = null;

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("igdb:selectedGameId");
        localStorage.removeItem("igdb:selectedGameTitle");
      }
    } catch (e) {
      console.error("Failed to remove game data from localStorage:", e);
    }
  },
};

export const GameSelector = (props: StringInputProps<StringSchemaType>) => {
  const { onChange, value, readOnly } = props;
  const sanityClient = useClient({ apiVersion: "2023-03-01" });
  const documentId = useFormValue(["_id"]) as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameCover, setSelectedGameCover] = useState<string | null>(
    null,
  );
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  // Debounced search function
  const searchGames = useCallback(
    debounce(async (term: string) => {
      if (!term) return;

      setIsLoading(true);
      setError(null);

      try {
        // Use the integrated API endpoint
        const response = await fetch(IGDB_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            query:
              `fields name,cover.url,first_release_date,id; search "${term}"; limit 10;`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          let errorMessage = `Failed to fetch games: ${errorData}`;

          // Try to parse the error to see if it's a JSON object
          try {
            const errorJson = JSON.parse(errorData);
            if (errorJson.error) {
              errorMessage = errorJson.error;
              if (errorJson.message) {
                errorMessage += `: ${errorJson.message}`;
              }
              if (errorJson.details) {
                errorMessage += ` (${errorJson.details})`;
              }
            }
          } catch (e) {
            // If the error isn't JSON, just use the text
          }

          console.error("IGDB API error:", errorMessage);
          throw new Error(errorMessage);
        }

        const games = await response.json();
        setSearchResults(games);
        setShowResults(true);
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error occurred when searching for games";

        let userFriendlyMessage = errorMessage;

        // Check for specific errors and provide more helpful messages
        if (errorMessage.includes("Missing Twitch API credentials")) {
          userFriendlyMessage =
            "API credentials not configured. Ask your site administrator to set up the IGDB integration.";
        } else if (errorMessage.includes("Authentication failed")) {
          userFriendlyMessage =
            "Authentication error with the game database. Please contact your administrator.";
        } else if (errorMessage.includes("Failed to fetch")) {
          userFriendlyMessage =
            "Could not connect to the game database. Check your internet connection or try again later.";
        }

        setError(userFriendlyMessage);
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [],
  );

  // Function to get detailed game data and update document
  const getGameDetailsAndUpdateDocument = async (game: Game) => {
    if (!game.id) return;

    // Store the selected game ID
    setSelectedGameId(game.id);

    // Store the game data in our global store
    IgdbStore.setSelectedGame(game.id, game.name);

    try {
      // Fetch expanded game data
      const response = await fetch(IGDB_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          expanded: true, // Signal that we want expanded data
          query: `fields id; where id = ${game.id};`, // Simple query to identify the game
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch detailed game data");
      }

      const detailedGames = await response.json();
      if (!detailedGames || detailedGames.length === 0) {
        throw new Error("No detailed data available for this game");
      }

      const detailedGame = detailedGames[0];

      // If the game has a cover image, store it for display
      if (detailedGame.cover && detailedGame.cover.url) {
        const coverUrl = detailedGame.cover.url.replace(
          "t_thumb",
          "t_cover_big",
        );
        const imageUrl = coverUrl.startsWith("//")
          ? `https:${coverUrl}`
          : coverUrl;
        setSelectedGameCover(imageUrl);
      } else {
        setSelectedGameCover(null);
      }
    } catch (error) {
      console.error("Failed to get detailed game data:", error);
      setSelectedGameCover(null);
    }
  };

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    // Set the title field value
    onChange(set(game.name));

    // Clear the search interface
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);

    // Fetch detailed game data and update other fields
    getGameDetailsAndUpdateDocument(game);
  };

  // Handle input change
  const handleInputChange = (
    e: React.FormEvent<HTMLInputElement> & {
      currentTarget: { value: string };
    },
  ) => {
    const newValue = e.currentTarget.value;
    setSearchTerm(newValue);

    if (newValue.length > 2) {
      searchGames(newValue);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle clearing the selected game
  const handleClear = () => {
    onChange(unset());
    setSearchTerm("");
    setSelectedGameCover(null);
    setSelectedGameId(null);

    // Clear the game data from our global store
    IgdbStore.resetSelectedGame();
  };

  // Format date from timestamp
  const formatReleaseDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown release date";
    return new Date(timestamp * 1000).getFullYear().toString();
  };

  // Render game cover image if available
  const renderGameCover = () => {
    if (!selectedGameCover) return null;

    return (
      <Box marginBottom={3}>
        <img
          src={selectedGameCover}
          alt="Game cover"
          style={{
            maxWidth: "120px",
            maxHeight: "180px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </Box>
    );
  };

  // Try to restore game ID from localStorage if available
  useEffect(() => {
    if (value && !selectedGameId) {
      try {
        const storedId = typeof localStorage !== "undefined"
          ? localStorage.getItem("igdb:selectedGameId")
          : null;

        if (storedId) {
          const parsedId = parseInt(storedId, 10);
          if (!isNaN(parsedId)) {
            setSelectedGameId(parsedId);
            // Also update our store if needed
            if (!IgdbStore.selectedGameId) {
              IgdbStore.selectedGameId = parsedId;
              IgdbStore.selectedGameTitle = value;
            }
          }
        }
      } catch (e) {
        console.error(
          "Failed to restore game ID from localStorage:",
          e,
        );
      }
    }
  }, [value, selectedGameId]);

  return (
    <Stack space={3}>
      {/* Selected game display or search input */}
      {value
        ? (
          <>
            {renderGameCover()}
            <Flex align="center">
              <Box flex={1}>
                <Text weight="semibold">{value}</Text>
                {selectedGameId && (
                  <input
                    type="hidden"
                    data-igdb-game-id={selectedGameId}
                    data-igdb-game-title={value}
                  />
                )}
              </Box>
              <Button
                mode="ghost"
                text="Clear"
                tone="critical"
                onClick={handleClear}
                disabled={readOnly}
              />
            </Flex>
          </>
        )
        : (
          <TextInput
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for a game..."
            disabled={readOnly}
            onFocus={() => {
              if (searchTerm.length > 2) {
                setShowResults(true);
              }
            }}
            onBlur={() => {
              // Delay hiding results to allow for selection
              setTimeout(() => setShowResults(false), 200);
            }}
          />
        )}

      {/* Loading indicator */}
      {isLoading && (
        <Flex justify="center" padding={3}>
          <Spinner />
        </Flex>
      )}

      {/* Error message */}
      {error && (
        <Card padding={3} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
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
                      src={game.cover.url.startsWith("//")
                        ? `https:${game.cover.url}`
                        : game.cover.url}
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
                      ({formatReleaseDate(
                        game.first_release_date,
                      )})
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
        searchResults.length === 0 && !isLoading && (
        <Card padding={3} tone="caution">
          <Text size={1}>No games found matching "{searchTerm}"</Text>
        </Card>
      )}
    </Stack>
  );
};

export default GameSelector;
