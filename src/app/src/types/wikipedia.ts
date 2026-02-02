export interface WikipediaData {
  description: string;
  image?: string;
  url: string;
  title?: string;
}

export interface WikipediaApiResponse {
  type: string;
  title: string;
  displaytitle: string;
  extract: string;
  extract_html?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls: {
    desktop: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
    mobile: {
      page: string;
      revisions: string;
      edit: string;
      talk: string;
    };
  };
}

export interface WikipediaCardProps {
  data: WikipediaData | null;
  loading?: boolean;
  type?: "book" | "author";
}