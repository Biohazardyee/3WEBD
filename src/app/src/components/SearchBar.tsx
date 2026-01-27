import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import "./SearchBar.css";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        className="search-input"
        value={query}
        placeholder="Search books, authors..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="search-button" type="submit"></button>
    </form>
  );
};

export default SearchBar;
