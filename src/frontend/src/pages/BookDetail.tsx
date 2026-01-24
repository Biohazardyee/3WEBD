import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookByKey } from "../api/openLibrary";
import { fetchWikipediaData } from "../api/wikipedia";
import type {WikipediaData} from "../types/wikipedia";
import * as React from "react";
import type {OpenLibraryWork} from "../types/openLibrary.tsx";

const BookDetail: React.FC = () => {
    const { key } = useParams<{ key: string }>();
    const [book, setBook] = useState<OpenLibraryWork>();
    const [wiki, setWiki] = useState<WikipediaData | null>(null);

    useEffect(() => {
        if (!key || !key.startsWith("OL")) return;

        getBookByKey(`/works/${key}`)
            .then((data) => {
                setBook(data);
                return fetchWikipediaData(data.title);
            })
            .then(setWiki)
            .catch(console.error);
    }, [key]);

    if (!book) return <p>Loading...</p>;

    return (
        <div>
            <h1>{book.title}</h1>
            <p>{book?.description || "No description available"}</p>

            {wiki && (
                <>
                    <h2>Wikipedia</h2>
                    <p>{wiki.description}</p>
                    {wiki.image && <img src={wiki.image} alt="Book cover" />}
                    {wiki.url && (
                        <a href={wiki.url} target="_blank" rel="noreferrer">
                            Read more on Wikipedia
                        </a>
                    )}
                </>
            )}
        </div>
    );
};

export default BookDetail;
