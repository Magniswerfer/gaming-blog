import { defineField, defineType } from "sanity";

export default defineType({
    name: "tekstside",
    title: "Tekstside",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Titel",
            type: "string",
            validation: (Rule) =>
                Rule.required().error("En titel er påkrævet."),
        }),
        defineField({
            name: "subtitle",
            title: "Undertitel",
            type: "string",
        }),
        defineField({
            name: "coverImage",
            title: "Forsidebillede",
            type: "image",
            options: {
                hotspot: true,
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
            validation: (Rule) => Rule.required().error("En slug er påkrævet."),
        }),
        defineField({
            name: "body",
            title: "Indhold",
            type: "array",
            of: [
                {
                    type: "block",
                },
                {
                    type: "image",
                    options: { hotspot: true },
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: "title",
            media: "coverImage",
        },
    },
});
