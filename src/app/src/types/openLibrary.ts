export interface OpenLibraryAuthorRef {
  author: {
    key: string;
  };
  type?: {
    key: string;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  coverUrl: string;
  description: string;
  subjects: string[];
  language: string;
  isbn: string;
  pages: number;
  publisher: string;
  dateAdded: string;
}

export interface OpenLibraryAuthor {
  key: string;
  name: string;
  bio?: string | { value: string };
  birth_date?: string;
  death_date?: string;
  photos?: number[];
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
  subject?: string[];
  language?: string[];
  isbn?: string[];
  publisher?: string[];
  number_of_pages_median?: number;
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
  changes: {
    key: string;
  }[];
  author: {
    key: string;
  };
}

export interface EnrichedChange extends RecentChange {
  bookData?: OpenLibraryWork;
}
