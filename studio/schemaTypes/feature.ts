import { defineField, defineType } from "sanity";

export default defineType({
    name: "feature",
    title: "Feature",
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
            name: "subtitle",
            title: "Undertitel",
            type: "string",
        }),
        defineField({
            name: "resume",
            title: "Resumé",
            type: "text",
            rows: 3,
            description: "Et kort resumé af artiklen",
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
            subtitle: "subtitle",
            author: "author.name",
            media: "mainImage",
        },
        prepare(selection) {
            const { author, subtitle } = selection;
            return {
                ...selection,
                subtitle: `${subtitle || ""} ${author ? `| af ${author}` : ""}`,
            };
        },
    },
});
