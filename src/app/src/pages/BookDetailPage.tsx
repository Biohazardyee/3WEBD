import {useState, useEffect, type SyntheticEvent} from "react";
import { useParams, Link } from "react-router-dom";
import { getBookByKey, getAuthorByKey } from "../api/openLibrary";
import {
  fetchWikipediaDataForBook,
  fetchWikipediaDataForAuthor,
} from "../api/wikipedia";
import type { OpenLibraryAuthor, OpenLibraryWork } from "../types/openLibrary";
import type { WikipediaData } from "../types/wikipedia";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { WikipediaCard } from "../components/WikipediaCard";
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
  Book,
  Hash,
  FileText,
} from "lucide-react";

export function BookDetailPage() {
  const { "*": bookPath } = useParams();
  const [author, setAuthor] = useState<OpenLibraryAuthor | null>(null);
  const [book, setBook] = useState<OpenLibraryWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicationYear, setPublicationYear] = useState<number | null>(null);

  const [wikipediaBook, setWikipediaBook] = useState<WikipediaData | null>(
    null,
  );
  const [wikipediaAuthor, setWikipediaAuthor] = useState<WikipediaData | null>(
    null,
  );
  const [wikipediaLoading, setWikipediaLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async (): Promise<void> => {
      if (!bookPath) {
        setError("Invalid book ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const key: string = bookPath.startsWith("/") ? bookPath : `/${bookPath}`;

        if (!key.match(/^\/works\/OL\d+W$/)) {
          throw new Error("Invalid book ID format");
        }

        const bookData: OpenLibraryWork = await getBookByKey(key);

        if (!bookData) {
          throw new Error("Book not found");
        }

        setBook(bookData);

        if (bookData.created?.value) {
          const year: number = new Date(bookData.created.value).getFullYear();
          setPublicationYear(year);
        }

        let authorData: OpenLibraryAuthor | null = null;
        if (bookData.authors && bookData.authors.length > 0) {
          const authorKey: string = bookData.authors[0].author.key;
          try {
            authorData = await getAuthorByKey(authorKey);
            setAuthor(authorData);
          } catch (err) {
            console.error("Error fetching author:", err);
          }
        }

        setWikipediaLoading(true);
        try {
          const wikiBook: WikipediaData | null = await fetchWikipediaDataForBook(
            bookData.title,
            authorData?.name,
          );
          setWikipediaBook(wikiBook);

          if (authorData?.name) {
            const wikiAuthor: WikipediaData | null = await fetchWikipediaDataForAuthor(
              authorData?.name,
            );
            setWikipediaAuthor(wikiAuthor);
          }
        } catch (err) {
          console.error("Error fetching Wikipedia data:", err);
        } finally {
          setWikipediaLoading(false);
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Failed to fetch book details. The book may not exist or the ID is invalid.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl mb-2">Error Loading Book</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              to="/search?q="
              className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors"
            >
              Search Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <Book className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The book you're looking for doesn't exist in our catalog. Please
            check the ID and try again.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              to="/advanced-search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors"
            >
              Advanced Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const description: string =
    typeof book.description === "string"
      ? book.description
      : book.description?.value || "No description available for this book.";

  const coverUrl: string = book.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : placeHolderBook;

  const authorKey: string | undefined = book.authors?.[0]?.author?.key;
  const authorName = author?.name || "Unknown Author";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl bg-muted">
                <img
                  src={coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover"
                  onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = placeHolderBook;
                  }}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View on OpenLibrary
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Author */}
            <div>
              <h1 className="text-4xl md:text-5xl mb-4 leading-tight">
                {book.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-2 text-xl text-muted-foreground mb-3">
                <User className="w-5 h-5" />
                {authorKey ? (
                  <a
                    href={`https://openlibrary.org${authorKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors hover:underline"
                  >
                    {authorName}
                  </a>
                ) : (
                  <span>{authorName}</span>
                )}
              </div>

              {/* Publication Date */}
              {publicationYear && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Published in {publicationYear}</span>
                </div>
              )}
            </div>

            {/* Metadata Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Type</span>
                </div>
                <p className="font-medium">Work</p>
              </div>

              {book.covers && book.covers.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Covers</span>
                  </div>
                  <p className="font-medium">{book.covers.length}</p>
                </div>
              )}

              {book.subjects && book.subjects.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">Subjects</span>
                  </div>
                  <p className="font-medium">{book.subjects.length}</p>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm">Work ID</span>
                </div>
                <p className="font-mono text-xs truncate font-medium">
                  {book.key.split("/").pop()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>

            {/* Subjects */}
            {book.subjects && book.subjects.length > 0 && (
              <div className="bg-secondary rounded-xl p-6">
                <h3 className="text-lg mb-4">Subjects & Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {book.subjects.slice(0, 20).map((subject, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-card rounded-lg border border-border text-sm hover:bg-card/80 transition-colors"
                    >
                      {subject}
                    </span>
                  ))}
                  {book.subjects.length > 20 && (
                    <span className="px-4 py-2 text-muted-foreground text-sm">
                      +{book.subjects.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Wikipedia Integration - Book (FR5) */}
            <div>
              <h2 className="text-2xl mb-4">Wikipedia - Book Information</h2>
              <WikipediaCard
                data={wikipediaBook}
                loading={wikipediaLoading}
                type="book"
              />
            </div>

            {/* Wikipedia Integration - Author (FR5) */}
            {authorName !== "Unknown Author" && (
              <div>
                <h2 className="text-2xl mb-4">
                  Wikipedia - Author Information
                </h2>
                <WikipediaCard
                  data={wikipediaAuthor}
                  loading={wikipediaLoading}
                  type="author"
                />
              </div>
            )}

            {/* Additional Metadata */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="text-lg mb-4">Additional Information</h3>
              <div className="space-y-3 text-sm">
                {book.created?.value && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">
                        Added to OpenLibrary:
                      </span>
                      <span className="ml-2 font-medium">
                        {new Date(book.created.value).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {book.last_modified?.value && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground">
                        Last Updated:
                      </span>
                      <span className="ml-2 font-medium">
                        {new Date(book.last_modified.value).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">
                      OpenLibrary Key:
                    </span>
                    <code className="ml-2 font-mono bg-card px-2 py-1 rounded text-xs">
                      {book.key}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="bg-gradient-to-br from-primary/5 to-background rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl mb-2">Explore More</h2>
                  <p className="text-sm text-muted-foreground">
                    Find additional information about this book on external
                    sources
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(book.title + " " + authorName + " book")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Google Search
                  <ExternalLink className="w-3 h-3" />
                </a>

                {authorKey && (
                  <a
                    href={`https://openlibrary.org${authorKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors text-sm"
                  >
                    Author Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
