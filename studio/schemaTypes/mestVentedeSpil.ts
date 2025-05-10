import { defineField, defineType } from "sanity";

export default defineType({
  name: "mestVentedeSpil",
  title: "Mest Ventede Spil",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Title for this anticipated game entry",
    }),
    defineField({
      name: "game",
      title: "Game",
      type: "reference",
      to: [{ type: "gameData" }],
      description: "Reference to the game data",
    }),
    defineField({
      name: "teaserText",
      title: "Teaser Text",
      type: "text",
      description:
        "A short, engaging teaser about why this game is anticipated",
      validation: (Rule) =>
        Rule.max(300).warning("Teaser text should be concise"),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
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
      gameTitle: "game.title",
      teaserText: "teaserText",
    },
    prepare(selection) {
      const { title, gameTitle, teaserText } = selection;
      return {
        title: title || gameTitle || "Unnamed entry",
        subtitle: teaserText ? `${teaserText.substring(0, 50)}...` : "",
      };
    },
  },
});
