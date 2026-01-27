import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockBooks,  type Book } from '../data/mockBooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, User, Globe, BookOpen, Tag, ExternalLink, ArrowLeft } from 'lucide-react';

export function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setLoading(true);
    const timer = setTimeout(() => {
      const foundBook = mockBooks.find((b) => b.id === id);
      setBook(foundBook || null);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/results"
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
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Author */}
            <div>
              <h1 className="text-4xl md:text-5xl mb-4">{book.title}</h1>
              <div className="flex items-center gap-2 text-xl text-muted-foreground mb-2">
                <User className="w-5 h-5" />
                <span>{book.author}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Published {book.year}</span>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Language</span>
                </div>
                <p>{book.language}</p>
              </div>

              {book.pages && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Pages</span>
                  </div>
                  <p>{book.pages}</p>
                </div>
              )}

              {book.isbn && (
                <div className="bg-card rounded-xl border border-border p-4 col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">ISBN</span>
                  </div>
                  <p className="font-mono text-sm">{book.isbn}</p>
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="bg-secondary rounded-xl p-6">
              <h3 className="text-lg mb-3">Subjects & Categories</h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-card rounded-lg border border-border text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl mb-4">About this Book</h2>
              <p className="text-muted-foreground leading-relaxed">
                {book.description}
              </p>
              {book.publisher && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Published by {book.publisher}
                </p>
              )}
            </div>

            {/* Wikipedia Section */}
            <div className="bg-gradient-to-br from-primary/5 to-background rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl mb-2">Wikipedia Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Learn more about this book on Wikipedia
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {book.description}
              </p>

              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(book.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View on Wikipedia
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Reserve Book
              </button>
              <button className="px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
