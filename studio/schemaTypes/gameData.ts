import { defineField, defineType } from "sanity";
import GameJsonDisplay from "../components/GameJsonDisplay.tsx";

export default defineType({
    name: "gameData",
    title: "Game Data",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Name of the game",
        }),
        defineField({
            name: "gameJson",
            title: "Game Data",
            type: "text",
            description: "Game data from IGDB stored as JSON",
            components: {
                input: GameJsonDisplay,
            },
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            gameJsonString: "gameJson",
        },
        prepare(selection) {
            const { title, gameJsonString } = selection;
            let subtitle = "";

            try {
                if (gameJsonString) {
                    const gameJson = JSON.parse(gameJsonString);

                    // Get the first genre as subtitle if available
                    if (gameJson.genres && gameJson.genres.length > 0) {
                        subtitle = `Genre: ${gameJson.genres[0].name}`;
                    }
                }
            } catch (e) {
                // If parsing fails, just use the title
                console.error("Failed to parse game JSON for preview:", e);
            }

            return {
                title,
                subtitle,
                // Do not set media directly from URL as it causes rendering issues
            };
        },
    },
});
