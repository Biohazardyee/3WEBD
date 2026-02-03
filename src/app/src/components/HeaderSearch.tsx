import { useNavigate } from "react-router-dom";
import {type ChangeEvent, useState} from "react";

const HeaderSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative"
    >
      <input
        type="search"
        placeholder="Quick search for books..."
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        className="
          w-full rounded-full border border-gray-200
          py-3 pl-12 pr-4 text-sm
          placeholder:text-gray-400
          focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20
        "
      />

      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
    </form>
  );
};

export default HeaderSearch;
