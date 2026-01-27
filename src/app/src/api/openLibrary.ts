import axios from "axios";
import type { OpenLibrarySearchResponse, OpenLibraryWork, RecentChange } from "../types/openLibrary";

const api = axios.create({
    baseURL: "https://openlibrary.org",
    timeout: 5000,
});

export const searchBooks = async (
    query: string
): Promise<OpenLibrarySearchResponse> => {
    if (!query.trim()) {
        throw new Error("Query is required");
    }

    const { data } = await api.get<OpenLibrarySearchResponse>(
        "/search.json",
        { params: { q: query } }
    );

    return data;
};

export const advancedSearch = async (
    params: Record<string, string>
): Promise<OpenLibrarySearchResponse> => {
    const { data } = await api.get<OpenLibrarySearchResponse>("/search.json", { params });
    return data;
};

export const getBookByKey = async (key: string): Promise<OpenLibraryWork> => {
    if (!key) throw new Error("Invalid book key");
    const { data } = await api.get<OpenLibraryWork>(`${key}.json`);
    return data;
};

export const getRecentChanges = async (): Promise<RecentChange[]> => {
    const { data } = await api.get("/recentchanges.json", {
        params: { limit: 10 },
    });

    return data;
};
