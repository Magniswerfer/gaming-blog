import { Content } from "../types/content.ts";

// Helper function to get the correct route for different content types
export function getContentRoute(content: Content): string {
  switch (content._type) {
    case "feature":
      return `/features/${content.slug.current}`;
    case "anmeldelse":
      return `/anmeldelser/${content.slug.current}`;
    case "debat":
      return `/debat/${content.slug.current}`;
    case "nyhed":
      return `/nyhed/${content.slug.current}`;
    default:
      return `/${content.slug.current}`;
  }
}

// Helper function to get excerpt text
export function getExcerptText(content: Content): string {
  if (content.resume) return content.resume;
  if (content.summary) return content.summary;
  if (content.ingress) return content.ingress;
  if (content.excerpt) return content.excerpt;
  if (content.subtitle) return content.subtitle;
  return "Ingen resumé tilgængelig";
}
