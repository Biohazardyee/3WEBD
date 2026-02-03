import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BookCard } from "../components/BookCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { searchBooks, advancedSearch } from "../api/openLibrary";
import type {Book, OpenLibrarySearchDoc} from "../types/openLibrary";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import placeholderBook from "../assets/placeholder-book.png";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;

  useEffect(() => {
    const fetchBooks = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const quickQuery: string | null = searchParams.get("q");
        const title: string | null = searchParams.get("title");
        const author: string | null = searchParams.get("author");
        const subject: string | null = searchParams.get("subject");
        const page: number = parseInt(searchParams.get("page") || "1");

        setCurrentPage(page);

        let results;

        if (
          !quickQuery &&
          !title &&
          !author &&
          !subject
        ) {

          results = await searchBooks("*", page, 100);
        } else if (quickQuery) {
          results = await searchBooks(quickQuery, page, resultsPerPage);
        } else if (title || author || subject) {
          const params: Record<string, string> = {};

          if (title) params.title = title;
          if (author) params.author = author;
          if (subject) params.subject = subject;

          results = await advancedSearch(params, page, resultsPerPage);
        } else {
          setError("No search parameters provided");
          setLoading(false);
          return;
        }

        if (!results || !results.docs) {
          setError("No results found");
          setBooks([]);
          setTotalResults(0);
          setLoading(false);
          return;
        }

        let filteredDocs: OpenLibrarySearchDoc[] = results.docs;

        const transformedBooks: Book[] = filteredDocs.map((doc: OpenLibrarySearchDoc) => ({
          id: doc.key,
          title: doc.title || "Unknown Title",
          author: doc.author_name?.[0] || "Unknown Author",
          year: doc.first_publish_year || 0,
          coverUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : placeholderBook,
          description: "",
          subjects: doc.subject?.slice(0, 3) || [],
          language: doc.language?.[0] || "en",
          isbn: doc.isbn?.[0] || "",
          pages: doc.number_of_pages_median || 0,
          publisher: doc.publisher?.[0] || "",
          dateAdded: new Date().toISOString(),
        }));

        setBooks(transformedBooks);

      } catch (err) {
        console.error("Search error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch search results",
        );
        setBooks([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams]);

  const getSearchSummary = (): string => {
    const quickQuery: string | null = searchParams.get("q");
    if (quickQuery) return `Results for "${quickQuery}"`;

    const parts: string[] = [];
    const title: string | null = searchParams.get("title");
    const author: string | null = searchParams.get("author");
    const subject: string | null = searchParams.get("subject");

    if (title) parts.push(`Title: "${title}"`);
    if (author) parts.push(`Author: "${author}"`);
    if (subject) parts.push(`Subject: "${subject}"`);

    return parts.length > 0
      ? `Search filters: ${parts.join(", ")}`
      : "Search Results";
  };

  const handlePageChange = (newPage: number): void => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages: number = Math.ceil(totalResults / resultsPerPage);
  const hasNextPage: boolean = currentPage < totalPages;
  const hasPrevPage: boolean = currentPage > 1;

  const getPageNumbers = (): (string | number)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start: number = Math.max(2, currentPage - 1);
      const end: number = Math.min(totalPages - 1, currentPage + 1);

      for (let i: number = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Search Error
              </h3>
              <p className="text-red-800">{error}</p>
              <button
                onClick={(): void => window.history.back()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">{getSearchSummary()}</h1>
          <p className="text-muted-foreground">
            {totalResults === 0
              ? "No books found matching your criteria"
              : `Found ${totalResults.toLocaleString()} ${totalResults === 1 ? "book" : "books"}${totalPages > 1 ? ` - Page ${currentPage} of ${totalPages}` : ""}`}
          </p>
        </div>

        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {books.map((book: Book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Previous button */}
                <button
                  onClick={(): void => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    hasPrevPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-2">
                  {getPageNumbers().map((pageNum: string | number, idx: number) => {
                    if (pageNum === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-4 py-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={(): void => handlePageChange(pageNum as number)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next button */}
                <button
                  onClick={(): void => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    hasNextPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No books found matching your search criteria
            </p>
            <button
              onClick={(): void => window.history.back()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Different Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
