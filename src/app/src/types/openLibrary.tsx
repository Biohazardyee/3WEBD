export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export interface OpenLibraryAuthorRef {
  author: {
    key: string;
  };
  type?: {
    key: string;
  };
}

export interface OpenLibraryWork {
  key: string;
  title: string;
  description?: string | { value: string }; 
  covers?: number[];
  authors?: OpenLibraryAuthorRef[];
  subjects?: string[];
  created?: { value: string };
  last_modified?: { value: string };
}

export interface OpenLibrarySearchDoc {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    language?: string[];
}

export interface OpenLibrarySearchResponse {
    numFound: number;
    start: number;
    docs: OpenLibrarySearchDoc[];
}

export interface RecentChange {
  id: string;
  kind: string;
  timestamp: string;
  comment?: string;
  entities: string[];
  author: {
    key: string;
  };
}

export interface EnrichedChange extends RecentChange {
  bookData?: OpenLibraryWork;
}
