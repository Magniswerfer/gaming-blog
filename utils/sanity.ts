import { createClient } from "https://esm.sh/@sanity/client@6.12.3";
import imageUrlBuilder from "https://esm.sh/@sanity/image-url@1.0.2";

interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn: boolean;
}

const config: SanityConfig = {
  projectId: Deno.env.get("SANITY_PROJECT_ID") || "lebsytll",
  dataset: Deno.env.get("SANITY_DATASET") || "production",
  apiVersion: "2024-02-21",
  useCdn: true,
};

export const client = createClient(config);

// Create an image URL builder using the Sanity client
const builder = imageUrlBuilder(client);

// A helper function to generate image URLs with transformations
export function urlFor(source: any) {
  return builder.image(source);
}

// Utility function to generate an optimized image URL based on width/height needs
export function getOptimizedImageUrl(
  source: any,
  width?: number,
  height?: number,
) {
  if (!source) return "";

  let imageUrl = builder.image(source);

  // Apply width and/or height transformations if provided
  if (width) {
    imageUrl = imageUrl.width(width);
  }

  if (height) {
    imageUrl = imageUrl.height(height);
  }

  // Apply automatic format detection
  imageUrl = imageUrl.auto("format");

  // Apply quality optimization based on image size
  // Use higher quality (90%) for small images to maintain clarity
  // Use standard quality (80%) for larger images to save bandwidth
  if (width && width < 300) {
    imageUrl = imageUrl.quality(90);
  } else {
    imageUrl = imageUrl.quality(80);
  }

  return imageUrl.url();
}
