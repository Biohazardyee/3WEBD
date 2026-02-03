import {type ChangeEvent, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, AlertCircle } from "lucide-react";

export function AdvancedSearchPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    yearFrom: "",
    yearTo: "",
    subject: "",
    language: "all",
  });
  const [error, setError] = useState("");

  const validateFilters = (): boolean => {
    const hasAnyFilter: string | boolean =
      filters.title.trim() ||
      filters.author.trim() ||
      filters.subject.trim() ||
      filters.yearFrom ||
      filters.yearTo ||
      (filters.language && filters.language !== "all");

    if (!hasAnyFilter) {
      setError("Please fill in at least one search field");
      return false;
    }

    if (filters.yearFrom && filters.yearTo) {
      const from = parseInt(filters.yearFrom);
      const to = parseInt(filters.yearTo);

      if (from > to) {
        setError('Year "From" cannot be greater than year "To"');
        return false;
      }
    }

    const currentYear = new Date().getFullYear();
    if (filters.yearFrom) {
      const from = parseInt(filters.yearFrom);
      if (from < 1000 || from > currentYear) {
        setError(`Year "From" must be between 1000 and ${currentYear}`);
        return false;
      }
    }
    if (filters.yearTo) {
      const to = parseInt(filters.yearTo);
      if (to < 1000 || to > currentYear) {
        setError(`Year "To" must be between 1000 and ${currentYear}`);
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!validateFilters()) {
      return;
    }

    const params = new URLSearchParams();

    if (filters.title.trim()) {
      params.append("title", filters.title.trim());
    }

    if (filters.author.trim()) {
      params.append("author", filters.author.trim());
    }

    if (filters.subject.trim()) {
      params.append("subject", filters.subject.trim());
    }

    if (filters.language && filters.language !== "all") {
      params.append("language", filters.language);
    }

    if (filters.yearFrom) {
      params.append("yearFrom", filters.yearFrom);
    }
    if (filters.yearTo) {
      params.append("yearTo", filters.yearTo);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleReset = (): void => {
    setFilters({
      title: "",
      author: "",
      yearFrom: "",
      yearTo: "",
      subject: "",
      language: "all",
    });
    setError("");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Advanced Search</h1>
          <p className="text-muted-foreground">
            Use multiple filters to find exactly what you're looking for
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-2 font-medium">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={filters.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilters({ ...filters, title: e.target.value })
              }
              placeholder="Enter book title (e.g., The Great Gatsby)"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Search for books by their title
            </p>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block mb-2 font-medium">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={filters.author}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilters({ ...filters, author: e.target.value })
              }
              placeholder="Enter author name (e.g., F. Scott Fitzgerald)"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Find books by a specific author
            </p>
          </div>

          {/* Publication Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="yearFrom" className="block mb-2 font-medium">
                Publication Year From
              </label>
              <input
                type="number"
                id="yearFrom"
                value={filters.yearFrom}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilters({ ...filters, yearFrom: e.target.value })
                }
                placeholder="e.g. 1900"
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="yearTo" className="block mb-2 font-medium">
                To
              </label>
              <input
                type="number"
                id="yearTo"
                value={filters.yearTo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFilters({ ...filters, yearTo: e.target.value })
                }
                placeholder={`e.g. ${new Date().getFullYear()}`}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">
                Filter books by publication year range (you can use only one
                field or both)
              </p>
            </div>
          </div>

          {/* Subject/Tags */}
          <div>
            <label htmlFor="subject" className="block mb-2 font-medium">
              Subject / Category
            </label>
            <input
              type="text"
              id="subject"
              value={filters.subject}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              placeholder="e.g. Fiction, Science, History, Romance"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Search by book category or subject
            </p>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block mb-2 font-medium">
              Language
            </label>
            <select
              id="language"
              value={filters.language}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilters({ ...filters, language: e.target.value })
              }
              className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            >
              <option value="all">All Languages</option>
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fre">French</option>
              <option value="ger">German</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
              <option value="chi">Chinese</option>
              <option value="jpn">Japanese</option>
              <option value="rus">Russian</option>
              <option value="ara">Arabic</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter by language (uses ISO 639-2 language codes)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              Search Books
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Clear All
            </button>
          </div>
        </form>

        {/* Quick tips */}
        <div className="mt-8 p-6 bg-secondary/50 rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-3">Search Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>At least one field required:</strong> Fill in any single
                field to start searching
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Year range search:</strong> You can search by year range
                alone (e.g., 1950-1960)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Combine filters:</strong> Use multiple fields together
                for more precise results
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Partial matches:</strong> You don't need the exact title
                or author name
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Language codes:</strong> Filtering uses ISO 639-2
                three-letter codes
              </span>
            </li>
          </ul>
        </div>

        {/* Examples */}
        <div className="mt-6 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-3">Example Searches</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Find all books from the 1920s:</p>
              <code className="block bg-background p-2 rounded border border-border text-xs">
                Year From: 1920, Year To: 1929
              </code>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Science fiction books:</p>
              <code className="block bg-background p-2 rounded border border-border text-xs">
                Subject: Science Fiction
              </code>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Books by Shakespeare:</p>
              <code className="block bg-background p-2 rounded border border-border text-xs">
                Author: Shakespeare
              </code>
            </div>
            <div className="space-y-2">
              <p className="font-medium">French novels from 1800s:</p>
              <code className="block bg-background p-2 rounded border border-border text-xs">
                Language: French, Year From: 1800, Year To: 1899
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
