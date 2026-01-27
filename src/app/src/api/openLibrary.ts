import axios from "axios";
import type {
    OpenLibrarySearchResponse,
    OpenLibraryWork,
    RecentChange,
    OpenLibraryAuthor,
} from "../types/openLibrary";

const api = axios.create({
    baseURL: "https://openlibrary.org",
    timeout: 5000,
});

export async function searchBooks(query: string, page = 1, limit = 100) {
    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
            query,
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
) {
    const query = new URLSearchParams({
        ...params,
        page: page.toString(),
        limit: limit.toString(),
    });
    const response = await fetch(
        `https://openlibrary.org/search.json?${query.toString()}`,
    );
    if (!response.ok) {
        throw new Error("Failed to fetch advanced search results");
    }
    return response.json();
}

export const getBookByKey = async (key: string): Promise<OpenLibraryWork> => {
    if (!key) throw new Error("Invalid book key");
    // FIX: Use parentheses instead of backticks
    const { data } = await api.get<OpenLibraryWork>(`${key}.json`);
    return data;
};

export const getRecentChanges = async (): Promise<RecentChange[]> => {
    const { data } = await api.get("/recentchanges.json", {
        params: { limit: 50 }, // Increase limit to get more changes
    });
    return data;
};

export const getAuthorByKey = async (
    key: string,
): Promise<OpenLibraryAuthor> => {
    if (!key) throw new Error("Invalid author key");
    // FIX: Use parentheses instead of backticks
    const { data } = await api.get<OpenLibraryAuthor>(`${key}.json`);
    return data;
};

export const getRecentBookAdditions = async (limit = 6) => {
    try {
        const { data } = await api.get("/recentchanges.json", {
            params: { limit: 20 },
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
            // Stop when we have enough books
            if (books.length >= limit) break;

            try {
                const book = await getBookByKey(key);

                if (book.title) {
                    books.push(book);
                } else {
                }
            } catch (err) {
                console.error(`Failed to fetch book ${key}:`, err);
                // Continue to next book
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
