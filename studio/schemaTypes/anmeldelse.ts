import { defineField, defineType } from "sanity";

export default defineType({
    name: "anmeldelse",
    title: "Anmeldelse",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titel",
            type: "string",
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
            name: "author",
            title: "Forfatter",
            type: "reference",
            to: { type: "author" },
        }),
        defineField({
            name: "mainImage",
            title: "Hovedbillede",
            type: "image",
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: "rating",
            title: "Bedømmelse",
            type: "number",
            validation: (Rule) => Rule.min(0).max(10).precision(1),
        }),
        defineField({
            name: "gameData",
            title: "Spil information",
            type: "reference",
            to: { type: "gameData" },
            description: "Reference til spillets data fra IGDB",
        }),
        defineField({
            name: "categories",
            title: "Kategorier",
            type: "array",
            of: [{ type: "reference", to: { type: "category" } }],
        }),
        defineField({
            name: "publishedAt",
            title: "Udgivet den",
            type: "datetime",
        }),
        defineField({
            name: "redaktionensUdvalgte",
            title: "Redaktionens Udvalgte",
            type: "boolean",
            description: "Marker som redaktionens udvalgte",
            initialValue: false,
        }),
        defineField({
            name: "body",
            title: "Indhold",
            type: "blockContent",
        }),
    ],

    preview: {
        select: {
            title: "title",
            author: "author.name",
            media: "mainImage",
            rating: "rating",
            gameTitle: "gameData.title",
        },
        prepare(selection) {
            const { author, rating, gameTitle } = selection;
            let subtitle = author ? `af ${author}` : "";
            subtitle += rating ? ` | Bedømmelse: ${rating}/10` : "";
            subtitle += gameTitle ? ` | Spil: ${gameTitle}` : "";

            return {
                ...selection,
                subtitle,
            };
        },
    },
});
