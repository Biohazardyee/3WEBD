import axios from "axios";
import type { WikipediaData, WikipediaApiResponse } from "../types/wikipedia";

export const fetchWikipediaData = async (
  title: string
): Promise<WikipediaData | null> => {
  if (!title || title.trim().length === 0) {
    console.warn("Wikipedia: Empty title provided");
    return null;
  }

  try {
    const cleanTitle = title.trim();
    const encodedTitle = encodeURIComponent(cleanTitle);
    
    const { data } = await axios.get<WikipediaApiResponse>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`,
      {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!data || !data.extract) {
      console.log(`Wikipedia: No page found for "${cleanTitle}"`);
      return null;
    }

    return {
      title: data.title,
      description: data.extract,
      image: data.thumbnail?.source || data.originalimage?.source,
      url: data.content_urls?.desktop?.page,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log(`Wikipedia: Page not found for "${title}"`);
      } else {
        console.error("Wikipedia API error:", error.message);
      }
    } else {
      console.error("Wikipedia: Unexpected error:", error);
    }
    return null;
  }
};


export const fetchWikipediaDataForBook = async (
  bookTitle: string,
  authorName?: string
): Promise<WikipediaData | null> => {
  if (!bookTitle) return null;

  let result = await fetchWikipediaData(bookTitle);
  if (result) return result;

  result = await fetchWikipediaData(`${bookTitle} (novel)`);
  if (result) return result;

  result = await fetchWikipediaData(`${bookTitle} (book)`);
  if (result) return result;

  if (authorName) {
    result = await fetchWikipediaData(`${bookTitle} (${authorName})`);
    if (result) return result;
  }

  return null;
};

export const fetchWikipediaDataForAuthor = async (
  authorName: string
): Promise<WikipediaData | null> => {
  if (!authorName) return null;

  const result = await fetchWikipediaData(authorName);
  
  if (!result) {
    console.log(`Wikipedia: No page found for author "${authorName}"`);
  }
  
  return result;
};