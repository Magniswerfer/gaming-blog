import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Flex, Spinner, Text, useToast } from "@sanity/ui";
import { PatchEvent, set, useClient } from "sanity";
import { IgdbStore } from "./GameSelector.tsx";

// IGDB API endpoint
// For development, use the localhost URL directly
const IGDB_API_URL = "http://localhost:8000/api/igdb";
// In production, uncomment and use your deployed URL:
// const IGDB_API_URL = "https://your-production-domain.com/api/igdb";

// Create a global interface to add our custom events
declare global {
    interface WindowEventMap {
        "igdb:gameSelected": CustomEvent<{ gameId: number; gameTitle: string }>;
        "igdb:gameReset": CustomEvent;
    }

    interface Window {
        document: Document;
    }
}

interface IgdbDataButtonProps {
    gameTitle: string;
    fieldType:
        | "releaseYear"
        | "description"
        | "developer"
        | "publisher"
        | "platforms"
        | "genres"
        | "cover";
    onChange: (event: PatchEvent) => void;
}

const fieldTypeLabels = {
    releaseYear: "Release Year",
    description: "Description",
    developer: "Developer",
    publisher: "Publisher",
    platforms: "Platforms",
    genres: "Genres",
    cover: "Cover Image",
};

const IgdbDataButton = (props: IgdbDataButtonProps) => {
    const { gameTitle, fieldType, onChange } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [gameId, setGameId] = useState<number | null>(null);
    const toast = useToast();
    const client = useClient({ apiVersion: "2023-03-01" });

    // Try to get the game ID from the IgdbStore or localStorage
    useEffect(() => {
        // Check the store first
        if (IgdbStore.selectedGameId) {
            setGameId(IgdbStore.selectedGameId);
            return;
        }

        // If not in the store, try localStorage
        try {
            const storedId = typeof localStorage !== "undefined"
                ? localStorage.getItem("igdb:selectedGameId")
                : null;

            if (storedId) {
                const parsedId = parseInt(storedId, 10);
                if (!isNaN(parsedId)) {
                    setGameId(parsedId);
                    // Also update the store
                    IgdbStore.selectedGameId = parsedId;
                    IgdbStore.selectedGameTitle = gameTitle;
                }
            }
        } catch (e) {
            console.error("Failed to get game ID from localStorage:", e);
        }
    }, [gameTitle]);

    // Helper to upload image from URL to Sanity
    const uploadImageFromUrl = async (imageUrl: string) => {
        try {
            // Fetch the image as a blob
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Failed to fetch image");

            const blob = await response.blob();

            // Create a file object from the blob
            const filename = imageUrl.split("/").pop() || "cover.jpg";
            const file = new File([blob], filename, { type: blob.type });

            // Upload to Sanity
            const uploadedAsset = await client.assets.upload("image", file, {
                filename,
                title: `${gameTitle} cover`,
            });

            return {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: uploadedAsset._id,
                },
            };
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    const fetchData = useCallback(async () => {
        if (!gameTitle) {
            toast.push({
                status: "warning",
                title: "No game selected",
                description: "Please select a game title first",
            });
            return;
        }

        setIsLoading(true);
        setPreviewData(null);
        setShowPreview(false);

        try {
            // If we have the game ID directly, use it
            let gameIdToUse = gameId || IgdbStore.selectedGameId;

            // If we don't have the game ID, search for it
            if (!gameIdToUse) {
                console.log(
                    "No game ID available, searching by title:",
                    gameTitle,
                );

                const searchResponse = await fetch(IGDB_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        query:
                            `fields id,name; search "${gameTitle}"; limit 1;`,
                    }),
                });

                if (!searchResponse.ok) {
                    const errorData = await searchResponse.text();
                    let errorMessage = "Failed to search for game";

                    // Try to parse the error to see if it's a JSON object
                    try {
                        const errorJson = JSON.parse(errorData);
                        if (errorJson.error) {
                            errorMessage = errorJson.error;
                            if (errorJson.message) {
                                errorMessage += `: ${errorJson.message}`;
                            }
                        }
                    } catch (e) {
                        // If the error isn't JSON, just use the text
                        errorMessage += `: ${errorData}`;
                    }

                    throw new Error(errorMessage);
                }

                const searchResults = await searchResponse.json();

                if (!searchResults || searchResults.length === 0) {
                    throw new Error(`Game "${gameTitle}" not found in IGDB`);
                }

                gameIdToUse = searchResults[0].id;

                // Store the game ID for future use
                setGameId(gameIdToUse);
                if (gameIdToUse) {
                    IgdbStore.setSelectedGame(gameIdToUse, gameTitle);
                }
            } else {
                console.log("Using stored game ID:", gameIdToUse);
            }

            // Then fetch detailed data for the game using the ID
            const detailsResponse = await fetch(IGDB_API_URL, {
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
                        platforms.name, genres.name;
                        where id = ${gameIdToUse};
                    `,
                }),
            });

            if (!detailsResponse.ok) {
                const errorData = await detailsResponse.text();
                let errorMessage = "Failed to fetch game details";

                // Try to parse the error to see if it's a JSON object
                try {
                    const errorJson = JSON.parse(errorData);
                    if (errorJson.error) {
                        errorMessage = errorJson.error;
                        if (errorJson.message) {
                            errorMessage += `: ${errorJson.message}`;
                        }
                    }
                } catch (e) {
                    // If the error isn't JSON, just use the text
                    errorMessage += `: ${errorData}`;
                }

                throw new Error(errorMessage);
            }

            const detailedGames = await detailsResponse.json();

            if (!detailedGames || detailedGames.length === 0) {
                throw new Error("No detailed data found for this game");
            }

            const game = detailedGames[0];

            // Extract the specific data based on fieldType
            let fieldValue = null;
            let previewValue = null;

            switch (fieldType) {
                case "releaseYear":
                    if (game.first_release_date) {
                        fieldValue = new Date(game.first_release_date * 1000)
                            .getFullYear();
                        previewValue = fieldValue;
                    }
                    break;

                case "description":
                    fieldValue = game.summary || null;
                    previewValue = fieldValue
                        ? (fieldValue.length > 100
                            ? `${fieldValue.substring(0, 100)}...`
                            : fieldValue)
                        : null;
                    break;

                case "developer":
                    if (
                        game.involved_companies &&
                        game.involved_companies.length > 0
                    ) {
                        const developer = game.involved_companies.find(
                            (company: any) => company.developer,
                        );
                        if (developer && developer.company) {
                            fieldValue = developer.company.name;
                            previewValue = fieldValue;
                        }
                    }
                    break;

                case "publisher":
                    if (
                        game.involved_companies &&
                        game.involved_companies.length > 0
                    ) {
                        const publisher = game.involved_companies.find(
                            (company: any) => company.publisher,
                        );
                        if (publisher && publisher.company) {
                            fieldValue = publisher.company.name;
                            previewValue = fieldValue;
                        }
                    }
                    break;

                case "platforms":
                    if (game.platforms && game.platforms.length > 0) {
                        fieldValue = game.platforms.map((platform: any) =>
                            platform.name
                        );
                        previewValue = fieldValue.slice(0, 3).join(", ") +
                            (fieldValue.length > 3
                                ? ` (+${fieldValue.length - 3} more)`
                                : "");
                    }
                    break;

                case "genres":
                    if (game.genres && game.genres.length > 0) {
                        fieldValue = game.genres.map((genre: any) =>
                            genre.name
                        );
                        previewValue = fieldValue.join(", ");
                    }
                    break;

                case "cover":
                    if (game.cover && game.cover.url) {
                        // Process the image URL for higher resolution
                        const coverUrl = game.cover.url.replace(
                            "t_thumb",
                            "t_cover_big",
                        );
                        const imageUrl = coverUrl.startsWith("//")
                            ? `https:${coverUrl}`
                            : coverUrl;

                        // We'll set the preview image URL for display
                        previewValue = imageUrl;

                        // The actual field value will be set after confirmation
                        // to avoid unnecessary uploads
                        fieldValue = imageUrl;
                    }
                    break;
            }

            if (fieldValue !== null) {
                // Set the preview data
                setPreviewData({
                    fieldValue,
                    previewValue,
                });
                setShowPreview(true);
            } else {
                toast.push({
                    status: "warning",
                    title: "No data found",
                    description: `No ${
                        fieldTypeLabels[fieldType]
                    } data available for this game`,
                });
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);

            let errorMessage = error instanceof Error
                ? error.message
                : "Unknown error occurred";

            // Provide more user-friendly error messages
            if (errorMessage.includes("Missing Twitch API credentials")) {
                errorMessage =
                    "API credentials not configured. Ask your site administrator to set up the IGDB integration.";
            } else if (errorMessage.includes("Authentication failed")) {
                errorMessage =
                    "Authentication error with the game database. Please contact your administrator.";
            } else if (errorMessage.includes("Failed to fetch")) {
                errorMessage =
                    "Could not connect to the game database. Check your internet connection or try again later.";
            }

            toast.push({
                status: "error",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameTitle, fieldType, onChange, toast, client, gameId]);

    const handleConfirm = async () => {
        if (!previewData) return;

        setIsLoading(true);

        try {
            let valueToSet = previewData.fieldValue;

            // If this is a cover image, we need to upload it to Sanity
            if (fieldType === "cover" && typeof valueToSet === "string") {
                valueToSet = await uploadImageFromUrl(valueToSet);
            }

            // Use PatchEvent to update the field
            onChange(PatchEvent.from(set(valueToSet)));

            toast.push({
                status: "success",
                title: "Data applied",
                description: `Updated ${fieldTypeLabels[fieldType]} from IGDB`,
            });

            // Clear the preview
            setShowPreview(false);
            setPreviewData(null);
        } catch (error) {
            console.error("Failed to apply data:", error);
            toast.push({
                status: "error",
                title: "Error",
                description: error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setShowPreview(false);
        setPreviewData(null);
    };

    // Render preview content based on field type
    const renderPreview = () => {
        if (!previewData || !previewData.previewValue) return null;

        switch (fieldType) {
            case "cover":
                return (
                    <img
                        src={previewData.previewValue}
                        alt="Game cover"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            objectFit: "contain",
                            marginBottom: "10px",
                            borderRadius: "4px",
                        }}
                    />
                );
            default:
                return (
                    <Text size={1} style={{ marginBottom: "10px" }}>
                        {previewData.previewValue}
                    </Text>
                );
        }
    };

    return (
        <>
            <Button
                fontSize={1}
                padding={2}
                mode="ghost"
                tone="primary"
                text={isLoading && !showPreview ? undefined : `Fetch from IGDB`}
                onClick={fetchData}
                disabled={isLoading || !gameTitle}
                icon={isLoading && !showPreview ? <Spinner /> : undefined}
            />

            {showPreview && (
                <Card padding={3} radius={2} shadow={1} marginTop={2}>
                    <Text
                        weight="semibold"
                        size={1}
                        style={{ marginBottom: "10px" }}
                    >
                        Preview of {fieldTypeLabels[fieldType]}:
                    </Text>

                    {renderPreview()}

                    <Flex gap={2}>
                        <Button
                            fontSize={1}
                            padding={2}
                            mode="default"
                            tone="positive"
                            text={isLoading ? undefined : "Apply"}
                            onClick={handleConfirm}
                            disabled={isLoading}
                            icon={isLoading ? <Spinner /> : undefined}
                        />
                        <Button
                            fontSize={1}
                            padding={2}
                            mode="ghost"
                            tone="default"
                            text="Cancel"
                            onClick={handleCancel}
                            disabled={isLoading}
                        />
                    </Flex>
                </Card>
            )}
        </>
    );
};

export default IgdbDataButton;
