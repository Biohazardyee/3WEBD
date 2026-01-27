import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockBooks } from '../data/mockBooks';
import { BookCard } from '../components/BookCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertCircle, Filter } from 'lucide-react';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(mockBooks);

  useEffect(() => {
    // Simulate loading delay
    setLoading(true);
    
    const timer = setTimeout(() => {
      // Filter books based on search params
      let filtered = [...mockBooks];

      const query = searchParams.get('q');
      const title = searchParams.get('title');
      const author = searchParams.get('author');
      const yearFrom = searchParams.get('yearFrom');
      const yearTo = searchParams.get('yearTo');
      const subject = searchParams.get('subject');
      const language = searchParams.get('language');

      // Quick search (q parameter)
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (book) =>
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.subjects.some((s) => s.toLowerCase().includes(q))
        );
      }

      // Advanced search filters
      if (title) {
        filtered = filtered.filter((book) =>
          book.title.toLowerCase().includes(title.toLowerCase())
        );
      }

      if (author) {
        filtered = filtered.filter((book) =>
          book.author.toLowerCase().includes(author.toLowerCase())
        );
      }

      if (yearFrom) {
        filtered = filtered.filter((book) => book.year >= parseInt(yearFrom));
      }

      if (yearTo) {
        filtered = filtered.filter((book) => book.year <= parseInt(yearTo));
      }

      if (subject) {
        filtered = filtered.filter((book) =>
          book.subjects.some((s) =>
            s.toLowerCase().includes(subject.toLowerCase())
          )
        );
      }

      if (language && language !== 'all') {
        filtered = filtered.filter((book) => book.language === language);
      }

      setResults(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [] as any;
    searchParams.forEach((value, key) => {
      if (value && value !== 'all') {
        filters.push({ key, value });
      }
    });
    return filters;
  };

  const activeFilters = getActiveFilters();

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
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter: { key: string; value: string }, index: number) => (
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
        ) : results.length === 0 ? (
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
              Found <span className="text-foreground">{results.length}</span> {results.length === 1 ? 'book' : 'books'}
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {results.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination Placeholder */}
            {results.length > 12 && (
              <div className="mt-12 flex justify-center gap-2">
                <button className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors">
                  2
                </button>
                <button className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors">
                  3
                </button>
                <button className="px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors">
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
