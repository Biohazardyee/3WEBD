import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import * as React from "react";

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={query}
                placeholder="Search books..."
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default SearchBar;
