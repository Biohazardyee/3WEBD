import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { searchBooks, advancedSearch } from "../api/openLibrary";
import { BookCard } from "../components/BookCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AlertCircle, Filter } from "lucide-react";
import type { OpenLibrarySearchResponse } from "../types/openLibrary";
import placeholderBook from "../assets/placeholder-book.png";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<OpenLibrarySearchResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const RESULTS_PER_PAGE = 100;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        if (location.state?.results && page === 1) {
          setResults(location.state.results);
          setLoading(false);
          return;
        }

        const query = searchParams.get("q");
        const title = searchParams.get("title");
        const author = searchParams.get("author");
        const yearFrom = searchParams.get("yearFrom");
        const yearTo = searchParams.get("yearTo");
        const subject = searchParams.get("subject");
        const language = searchParams.get("language");

        let apiResults: OpenLibrarySearchResponse;

        if (query) {
          apiResults = await searchBooks(query, page, RESULTS_PER_PAGE);
        } else if (
          title ||
          author ||
          yearFrom ||
          yearTo ||
          subject ||
          language
        ) {
          const params: Record<string, string> = {};

          if (title) params.title = title;
          if (author) params.author = author;
          if (subject) params.subject = subject;
          if (language && language !== "all") params.language = language;

          if (yearFrom && yearTo) {
            params.publish_year = `${yearFrom}-${yearTo}`;
          } else if (yearFrom) {
            params.publish_year = `${yearFrom}-${new Date().getFullYear()}`;
          } else if (yearTo) {
            params.publish_year = `0-${yearTo}`;
          }

          apiResults = await advancedSearch(params, page, RESULTS_PER_PAGE);
        } else {
          setResults(null);
          setLoading(false);
          return;
        }

        setResults(apiResults);
      } catch (err) {
        console.error("Search error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch results",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, location.state, page]);

  // Get active filters for display
  const getActiveFilters = () => {
    const filters: { key: string; value: string }[] = [];
    searchParams.forEach((value, key) => {
      if (value && value !== "all") {
        filters.push({ key, value });
      }
    });
    return filters;
  };

  const activeFilters = getActiveFilters();

  const transformedBooks =
    results?.docs?.map((doc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] || "Unknown Author",
      year: doc.first_publish_year || 0,
      coverUrl:
        doc.cover_i === undefined
          ? placeholderBook
          : `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
      description: "",
      subjects: [],
      language: doc.language?.[0] || "en",
      isbn: "",
      pages: 0,
      publisher: "",
      dateAdded: new Date().toISOString(),
    })) || [];

  const totalPages = results
    ? Math.ceil(results.numFound / RESULTS_PER_PAGE)
    : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Search Results</h1>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  <span className="capitalize">{filter.key}:</span>
                  <span>{filter.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          /* Error State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl mb-2">Error loading results</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !results || transformedBooks.length === 0 ? (
          /* No Results */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-muted-foreground mb-6">
              Found{" "}
              <span className="text-foreground">
                {results.numFound?.toLocaleString()}
              </span>{" "}
              {results.numFound === 1 ? "book" : "books"}
              {transformedBooks.length < (results.numFound || 0) && (
                <span> (showing {transformedBooks.length})</span>
              )}
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {transformedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
                {/* Previous */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers (max 5 affichées) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = page <= 3 ? i + 1 : page - 2 + i;

                  if (pageNumber > totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : "border border-input hover:bg-secondary"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
