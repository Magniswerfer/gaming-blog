export interface Content {
  _type: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  publishedAt?: string;
  excerpt?: string;
  summary?: string;
  subtitle?: string;
  ingress?: string;
  resume?: string;
  underrubrik?: string;
  isBreaking?: boolean;
  redaktionensUdvalgte?: boolean;
  author?: {
    name: string;
  };
  rating?: number;
}

export interface DebatEntry {
  title: string;
  slug: { current: string };
  summary?: string;
  underrubrik?: string;
  publishedAt?: string;
  author?: {
    name: string;
  };
}

export interface MestVentedeSpil {
  title: string;
  teaserText: string;
  publishedAt: string;
  game: {
    title: string;
    gameJson: string;
    slug?: {
      current: string;
    };
  };
}
