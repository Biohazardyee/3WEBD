import axios from "axios";
import type {WikipediaData} from "../types/wikipedia";

export const fetchWikipediaData = async (
    title: string
): Promise<WikipediaData | null> => {
    if (!title) return null;

    const { data } = await axios.get(
        "https://en.wikipedia.org/api/rest_v1/page/summary/" +
        encodeURIComponent(title)
    );

    return {
        description: data.extract,
        image: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page,
    };
};
