import axios from "axios";
import type {
    OpenLibraryWork,
    OpenLibraryAuthor, OpenLibrarySearchResponse,
} from "../types/openLibrary";

const api = axios.create({
    baseURL: "https://openlibrary.org",
    timeout: 10000,
});

export async function searchBooks(query: string, page = 1, limit = 100): Promise<OpenLibrarySearchResponse> {
    if (!query || query.trim().length === 0) {
        throw new Error("Search query cannot be empty");
    }

    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
            query.trim(),
        )}&page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch search results");
    }

    return response.json();
}

export async function advancedSearch(
    params: Record<string, string>,
    page = 1,
    limit = 100,
): Promise<OpenLibrarySearchResponse> {

    const hasValidParam = Object.values(params).some(value => value && value.trim().length > 0);
    if (!hasValidParam) {
        throw new Error("At least one search parameter is required");
    }

    const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
    };

    if (params.title?.trim()) {
        queryParams.title = params.title.trim();
    }
    if (params.author?.trim()) {
        queryParams.author = params.author.trim();
    }
    if (params.subject?.trim()) {
        queryParams.subject = params.subject.trim();
    }
    if (params.language?.trim()) {
        queryParams.language = params.language.trim();
    }
    if (params.isbn?.trim()) {
        queryParams.isbn = params.isbn.trim();
    }
    if (params.publisher?.trim()) {
        queryParams.publisher = params.publisher.trim();
    }

    const query = new URLSearchParams(queryParams);

    const response = await fetch(
        `https://openlibrary.org/search.json?${query.toString()}`,
    );

    if (!response.ok) {
        throw new Error("Failed to fetch advanced search results");
    }

    return response.json();
}

export const getBookByKey = async (key: string): Promise<OpenLibraryWork> => {
    if (!key || key.trim().length === 0) {
        throw new Error("Invalid book key");
    }

    const { data } = await api.get<OpenLibraryWork>(`${key}.json`);
    return data;
};

export const getAuthorByKey = async (
    key: string,
): Promise<OpenLibraryAuthor> => {
    if (!key || key.trim().length === 0) {
        throw new Error("Invalid author key");
    }

    const { data } = await api.get<OpenLibraryAuthor>(`${key}.json`);
    return data;
};

export const getRecentBookAdditions = async (limit = 6) => {
    try {
        const { data } = await api.get("/recentchanges.json", {
            params: { limit: 100 },
        });

        const changes = data as any[];

        const bookChanges = changes.filter((change) => {
            return (
                change.changes &&
                change.changes.some((c: any) => c.key && c.key.startsWith("/works/"))
            );
        });

        const workKeys = new Set<string>();
        bookChanges.forEach((change) => {
            change.changes?.forEach((c: any) => {
                if (c.key && c.key.startsWith("/works/")) {
                    workKeys.add(c.key);
                }
            });
        });

        const books: OpenLibraryWork[] = [];
        const keysArray = Array.from(workKeys);

        for (const key of keysArray) {
            if (books.length >= limit) break;

            try {
                const book = await getBookByKey(key);

                // Only add books that have titles and covers
                if (book.title && book.covers && book.covers.length > 0) {
                    books.push(book);
                    console.log(`Added book: ${book.title}`);
                }
            } catch (err) {
                console.error(`Failed to fetch book ${key}:`, err);
            }
        }

        if (books.length < limit) {

            const { data: moreData } = await api.get("/recentchanges.json", {
                params: { limit: 500 },
            });

            const moreChanges = moreData as any[];
            const moreBookChanges = moreChanges.filter((change) =>
                change.changes?.some((c: any) => c.key && c.key.startsWith("/works/")),
            );

            const moreWorkKeys = new Set<string>();
            moreBookChanges.forEach((change) => {
                change.changes?.forEach((c: any) => {
                    if (c.key && c.key.startsWith("/works/") && !workKeys.has(c.key)) {
                        moreWorkKeys.add(c.key);
                    }
                });
            });

            for (const key of Array.from(moreWorkKeys)) {
                if (books.length >= limit) break;

                try {
                    const book = await getBookByKey(key);
                    if (book.title && book.covers && book.covers.length > 0) {
                        books.push(book);
                    }
                } catch (err) {
                    console.error(`Failed to fetch book ${key}:`, err);
                }
            }
        }
        return books.slice(0, limit);
    } catch (err) {
        console.error("Error fetching recent book additions:", err);
        return [];
    }
};