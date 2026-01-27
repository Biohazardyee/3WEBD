import axios from "axios";
import type { OpenLibrarySearchResponse, OpenLibraryWork, RecentChange } from "../types/openLibrary";
import type { OpenLibraryAuthor } from "../types/openLibrary";

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
    const { data } = await api.get<OpenLibraryWork>(`${key}.json`);
    return data;
};

export const getRecentChanges = async (): Promise<RecentChange[]> => {
    const { data } = await api.get("/recentchanges.json", {
        params: { limit: 10 },
    });
    return data;
};


export const getAuthorByKey = async (key: string): Promise<OpenLibraryAuthor> => {
  if (!key) throw new Error("Invalid author key");
  const { data } = await api.get<OpenLibraryAuthor>(`${key}.json`);
  return data;
};