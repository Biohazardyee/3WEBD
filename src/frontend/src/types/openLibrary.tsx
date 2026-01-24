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
}

export interface OpenLibraryWork {
    key: string;
    title: string;
    description?: string;
    covers?: number[];
    subjects?: string[];
    subject_places?: string[];
    subject_people?: string[];
    subject_times?: string[];
    authors?: OpenLibraryAuthorRef[];
    created?: {
        value: string;
    };
    last_modified?: {
        value: string;
    };
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
    comment?: string;
}