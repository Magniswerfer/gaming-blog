import { defineField, defineType } from "sanity";

export default defineType({
  name: "debat",
  title: "Debat",
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
      name: "underrubrik",
      title: "Underrubrik",
      type: "string",
      description: "En kort underrubrik til debatindlægget",
    }),
    defineField({
      name: "summary",
      title: "Resumé",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "kategorier",
      title: "Kategorier",
      type: "array",
      of: [{ type: "reference", to: { type: "kategori" } }],
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
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `af ${author}` };
    },
  },
});
