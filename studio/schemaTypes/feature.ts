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
      name: "kategorier",
      title: "Kategorier",
      type: "array",
      of: [{ type: "reference", to: { type: "kategori" } }],
    }),
    defineField({
      name: "gameData",
      title: "Spil information",
      type: "reference",
      to: { type: "gameData" },
      description: "Reference til spillets data fra IGDB",
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
      gameTitle: "gameData.title",
    },
    prepare(selection) {
      const { author, subtitle, gameTitle } = selection;
      let displaySubtitle = subtitle || "";
      if (author) {
        displaySubtitle += displaySubtitle
          ? ` | af ${author}`
          : `af ${author}`;
      }
      if (gameTitle) {
        displaySubtitle += displaySubtitle
          ? ` | Spil: ${gameTitle}`
          : `Spil: ${gameTitle}`;
      }

      return {
        ...selection,
        subtitle: displaySubtitle,
      };
    },
  },
});
