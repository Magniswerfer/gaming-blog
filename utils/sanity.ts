import { createClient } from "https://esm.sh/@sanity/client@6.12.3";

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
