import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookByKey, getAuthorByKey } from "../api/openLibrary";
import type { OpenLibraryAuthor } from "../types/openLibrary";
import type { OpenLibraryWork } from "../types/openLibrary";
import { LoadingSpinner } from "../components/LoadingSpinner";
import placeHolderBook from "../assets/placeholder-book.png";
import {
  Calendar,
  User,
  Globe,
  BookOpen,
  Tag,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export function BookDetailPage() {
  const { "*": bookPath } = useParams();
  const [author, setAuthor] = useState<OpenLibraryAuthor | null>(null);
  const [book, setBook] = useState<OpenLibraryWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookPath) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Add leading slash if not present
        const key = bookPath.startsWith("/") ? bookPath : `/${bookPath}`;
        const bookData = await getBookByKey(key);
        setBook(bookData);

        // Fetch author information if available
        if (bookData.authors && bookData.authors.length > 0) {
          const authorKey = bookData.authors[0].author.key;
          try {
            const authorData = await getAuthorByKey(authorKey);
            setAuthor(authorData);
          } catch (err) {
            console.error("Error fetching author:", err);
            // Continue even if author fetch fails
          }
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch book details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookPath]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl mb-2">Error loading book</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-2">Book not found</h2>
          <p className="text-muted-foreground mb-6">
            The book you're looking for doesn't exist in our catalog
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Extract description (can be string or object with value property)
  const description =
    typeof book.description === "string"
      ? book.description
      : book.description?.value || "No description available";

  // Get cover URL from covers array
  const coverUrl = book.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : placeHolderBook;

  // Get first author name
  const authorKey = book.authors?.[0]?.author?.key;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl bg-muted">
                <img
                  src={coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = placeHolderBook;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Author */}
            <div>
              <h1 className="text-4xl md:text-5xl mb-4">{book.title}</h1>
              {(author || authorKey) && (
                <div className="flex items-center gap-2 text-xl text-muted-foreground mb-2">
                  <User className="w-5 h-5" />
                  {author ? (
                    <a
                      href={`https://openlibrary.org${authorKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {author.name}
                    </a>
                  ) : (
                    <a
                      href={`https://openlibrary.org${authorKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      View Author
                    </a>
                  )}
                </div>
              )}
              {book.created?.value && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Added {new Date(book.created.value).getFullYear()}</span>
                </div>
              )}
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Type</span>
                </div>
                <p>Work</p>
              </div>

              {book.covers && book.covers.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">Covers</span>
                  </div>
                  <p>{book.covers.length}</p>
                </div>
              )}

              {book.key && (
                <div className="bg-card rounded-xl border border-border p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">ID</span>
                  </div>
                  <p className="font-mono text-sm truncate">{book.key}</p>
                </div>
              )}
            </div>

            {/* Subjects */}
            {book.subjects && book.subjects.length > 0 && (
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg mb-3">Subjects & Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {book.subjects.slice(0, 15).map((subject, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-card rounded-lg border border-border text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                  {book.subjects.length > 15 && (
                    <span className="px-4 py-2 text-muted-foreground text-sm">
                      +{book.subjects.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl mb-4">About this Book</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
              {book.last_modified?.value && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date(book.last_modified.value).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* OpenLibrary Link */}
            <div className="bg-gradient-to-br from-primary/5 to-background rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl mb-2">View on Open Library</h2>
                  <p className="text-sm text-muted-foreground">
                    Access more details and editions on OpenLibrary.org
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex gap-4">
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Work
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(book.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors"
                >
                  Wikipedia
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
