import { Link, useLocation } from "react-router-dom";
import { Search, BookOpen, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooks } from "../api/openLibrary";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchBooks(searchQuery.trim());

      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        state: { results },
      });
    } catch (error) {
      console.error("Search error:", error);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-30">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
            <div>
              <h1 className="text-4xl text-primary">Independant Library</h1>
              <p className="text-sm text-muted-foreground">Public Collection</p>
            </div>
          </Link>

          {/* Quick Search - Desktop */}
          <form
            onSubmit={handleQuickSearch}
            className="hidden md:block flex-1 max-w-xl mx-8"
          >
            <div className="relative">
              {isSearching ? (
                <Loader className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search for books..."
                disabled={isSearching}
                className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </form>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-5 py-3 text-base rounded-xl transition-colors ${
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              Home
            </Link>
            <Link
              to="/advanced-search"
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === "/advanced-search"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              Advanced Search
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === "/about"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              About
            </Link>
          </nav>
        </div>

        {/* Quick Search - Mobile */}
        <form onSubmit={handleQuickSearch} className="md:hidden pb-4">
          <div className="relative">
            {isSearching ? (
              <Loader className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search for books..."
              disabled={isSearching}
              className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
