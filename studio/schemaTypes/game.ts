import { defineField, defineType } from "sanity";
import GameSelector from "../components/GameSelector.tsx";
import withIgdbData from "../components/withIgdbData.tsx";

export default defineType({
    name: "game",
    title: "Game",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Game Title",
            type: "string",
            description: "The title of the game as found in IGDB",
            components: {
                input: GameSelector,
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
        defineField({
            name: "releaseYear",
            title: "Release Year",
            type: "number",
            validation: (Rule) => Rule.integer().positive(),
            description: "The year the game was released",
            components: {
                field: withIgdbData("releaseYear"),
            },
        }),
        defineField({
            name: "developer",
            title: "Developer",
            type: "string",
            description: "The primary developer of the game",
            components: {
                field: withIgdbData("developer"),
            },
        }),
        defineField({
            name: "publisher",
            title: "Publisher",
            type: "string",
            description: "The primary publisher of the game",
            components: {
                field: withIgdbData("publisher"),
            },
        }),
        defineField({
            name: "platforms",
            title: "Platforms",
            type: "array",
            of: [{ type: "string" }],
            options: {
                layout: "tags",
            },
            description: "Platforms the game is available on",
            components: {
                field: withIgdbData("platforms"),
            },
        }),
        defineField({
            name: "genres",
            title: "Genres",
            type: "array",
            of: [{ type: "string" }],
            options: {
                layout: "tags",
            },
            description: "Game genres",
            components: {
                field: withIgdbData("genres"),
            },
        }),
        defineField({
            name: "cover",
            title: "Cover Image",
            type: "image",
            options: {
                hotspot: true,
            },
            description: "Game box/cover art",
            components: {
                field: withIgdbData("cover"),
            },
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 5,
            description: "Official game summary",
            components: {
                field: withIgdbData("description"),
            },
        }),
    ],
    preview: {
        select: {
            title: "title",
            developer: "developer",
            media: "cover",
        },
        prepare(selection) {
            const { developer } = selection;
            return {
                ...selection,
                subtitle: developer ? `Developer: ${developer}` : "",
            };
        },
    },
});
