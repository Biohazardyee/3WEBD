import {useState, useEffect, type ChangeEvent} from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import { getRecentBookAdditions, getAuthorByKey } from "../api/openLibrary";
import type {OpenLibraryAuthor, OpenLibraryWork} from "../types/openLibrary";
import { BookCard } from "../components/BookCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import placeHolderBook from "../assets/placeholder-book.png";

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentBooks, setRecentBooks] = useState<OpenLibraryWork[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBooks = async (): Promise<void> => {
      setLoading(true);
      try {
        const books: OpenLibraryWork[] = await getRecentBookAdditions(6);
        setRecentBooks(books);

        const authors: Record<string, string> = {};

        for (const book of books) {
          if (book.authors && book.authors.length > 0) {
            const authorKey = book.authors[0].author.key;
            try {
              const author: OpenLibraryAuthor = await getAuthorByKey(authorKey);
              authors[book.key] = author.name;
            } catch (err) {
              console.error(`Failed to fetch author for ${authorKey}:`, err);
              authors[book.key] = "Unknown Author";
            }
          } else {
            authors[book.key] = "Unknown Author";
          }
        }

        setAuthorNames(authors);
      } catch (err) {
        console.error("Error fetching recent books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBooks();
  }, []);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const transformedBooks = recentBooks.map((book: OpenLibraryWork) => ({
    id: book.key,
    title: book.title,
    author: authorNames[book.key] || "Loading...",
    year: 0,
    coverUrl: book.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
      : placeHolderBook,
    description:
      typeof book.description === "string"
        ? book.description
        : book.description?.value || "",
    subjects: book.subjects?.slice(0, 3) || [],
    language: "en",
    isbn: "",
    pages: 0,
    publisher: "",
    dateAdded: book.created?.value || new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-6">
              Explore thousands of books from our public library
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover your next great read from our extensive collection
            </p>
            {/* Hero Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or subject..."
                  className="w-full pl-16 pr-6 py-5 text-lg border-2 border-input rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg transition-shadow"
                />
              </div>
              <button
                type="submit"
                className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Search Collection
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Recent Additions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-3xl">Recent Changes</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Recently updated books from OpenLibrary
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : transformedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {transformedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No recent book changes found. The API may not have recent book
            updates.
          </p>
        )}
      </section>

      {/* Statistics */}
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-center">
            <div className="bg-card rounded-xl p-8 shadow-sm">
              <div className="text-4xl text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Books in Collection</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
