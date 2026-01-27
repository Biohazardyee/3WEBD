import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { mockBooks } from '../data/mockBooks';
import { BookCard } from '../components/BookCard';

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get recent additions (last 6 books based on dateAdded)
  const recentBooks = [...mockBooks]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 6);

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          <h2 className="text-3xl">Recent Additions</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Newly added books to our collection
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-card rounded-xl p-8 shadow-sm">
              <div className="text-4xl text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Books in Collection</div>
            </div>
            <div className="bg-card rounded-xl p-8 shadow-sm">
              <div className="text-4xl text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div className="bg-card rounded-xl p-8 shadow-sm">
              <div className="text-4xl text-primary mb-2">130+</div>
              <div className="text-muted-foreground">Years of Service</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
