import { Content, DebatEntry, MestVentedeSpil } from "../types/content.ts";
import { SanityClient } from "https://esm.sh/@sanity/client@6.12.3";

export async function getLatestContent(
  client: SanityClient,
): Promise<Content[]> {
  return await client.fetch<Content[]>(
    `*[_type in ["nyhed", "feature", "anmeldelse", "debat"]] | order(publishedAt desc)[0...12] {
      _type,
      title,
      slug,
      "mainImage": mainImage{asset->{url}},
      publishedAt,
      excerpt,
      summary,
      subtitle,
      ingress,
      resume,
      underrubrik,
      isBreaking,
      redaktionensUdvalgte,
      "author": author->{name}
    }`,
  );
}

export async function getEditorsPicksContent(
  client: SanityClient,
): Promise<Content[]> {
  return await client.fetch<Content[]>(
    `*[_type in ["nyhed", "feature", "anmeldelse", "debat"] && redaktionensUdvalgte == true] | order(publishedAt desc)[0...5] {
      _type,
      title,
      slug,
      "mainImage": mainImage{asset->{url}},
      publishedAt,
      excerpt,
      summary,
      subtitle,
      ingress,
      resume,
      underrubrik,
      isBreaking,
      redaktionensUdvalgte,
      "author": author->{name}
    }`,
  );
}

export async function getRecentDebatEntries(
  client: SanityClient,
): Promise<DebatEntry[]> {
  return await client.fetch<DebatEntry[]>(
    `*[_type == "debat"] | order(publishedAt desc)[0...5] {
      title,
      slug,
      summary,
      underrubrik,
      publishedAt,
      "author": author->{name}
    }`,
  );
}

export async function getRecentNewsItems(
  client: SanityClient,
): Promise<Content[]> {
  return await client.fetch<Content[]>(
    `*[_type == "nyhed"] | order(publishedAt desc)[0...8] {
      _type,
      title,
      slug,
      "mainImage": mainImage{asset->{url}},
      publishedAt,
      resume,
      summary,
      isBreaking,
      "author": author->{name}
    }`,
  );
}

export async function getMestVentedeSpil(
  client: SanityClient,
): Promise<MestVentedeSpil[]> {
  return await client.fetch<MestVentedeSpil[]>(
    `*[_type == "mestVentedeSpil"] | order(publishedAt desc)[0...3] {
      title,
      teaserText,
      publishedAt,
      "game": game->{
        title,
        gameJson
      }
    }`,
  );
}
