import { useState } from "react";
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

  const validateFilters = () => {
    // Check if at least one field is filled
    const hasAnyFilter =
      filters.title ||
      filters.author ||
      filters.subject ||
      filters.yearFrom ||
      filters.yearTo ||
      (filters.language && filters.language !== "all");

    if (!hasAnyFilter) {
      setError("Please fill in at least one search field");
      return false;
    }

    // Validate year range
    if (filters.yearFrom && filters.yearTo) {
      const from = parseInt(filters.yearFrom);
      const to = parseInt(filters.yearTo);

      if (from > to) {
        setError('Year "From" cannot be greater than year "To"');
        return false;
      }
    }

    // Validate individual years
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFilters()) {
      return;
    }

    // Build query params for OpenLibrary API format
    const params = new URLSearchParams();

    // Add title
    if (filters.title.trim()) {
      params.append("title", filters.title.trim());
    }

    // Add author
    if (filters.author.trim()) {
      params.append("author", filters.author.trim());
    }

    // Add subject
    if (filters.subject.trim()) {
      params.append("subject", filters.subject.trim());
    }

    // Add language
    if (filters.language && filters.language !== "all") {
      params.append("language", filters.language);
    }

    // For year range, we'll pass both and handle in SearchResultsPage
    if (filters.yearFrom) {
      params.append("yearFrom", filters.yearFrom);
    }
    if (filters.yearTo) {
      params.append("yearTo", filters.yearTo);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleReset = () => {
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
              }
              placeholder="Enter book title"
              className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={filters.author}
              onChange={(e) =>
                setFilters({ ...filters, author: e.target.value })
              }
              placeholder="Enter author name"
              className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Publication Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="yearFrom" className="block mb-2">
                Publication Year From
              </label>
              <input
                type="number"
                id="yearFrom"
                value={filters.yearFrom}
                onChange={(e) =>
                  setFilters({ ...filters, yearFrom: e.target.value })
                }
                placeholder="e.g. 1900"
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="yearTo" className="block mb-2">
                To
              </label>
              <input
                type="number"
                id="yearTo"
                value={filters.yearTo}
                onChange={(e) =>
                  setFilters({ ...filters, yearTo: e.target.value })
                }
                placeholder={`e.g. ${new Date().getFullYear()}`}
                min="1000"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>
          </div>

          {/* Subject/Tags */}
          <div>
            <label htmlFor="subject" className="block mb-2">
              Subject / Category
            </label>
            <input
              type="text"
              id="subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              placeholder="e.g. Fiction, Science, History"
              className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block mb-2">
              Language
            </label>
            <select
              id="language"
              value={filters.language}
              onChange={(e) =>
                setFilters({ ...filters, language: e.target.value })
              }
              className="w-full px-4 py-3 border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
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
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 border border-input rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Clear
            </button>
          </div>
        </form>

        {/* Quick tips */}
        <div className="mt-8 p-6 bg-secondary rounded-xl">
          <h3 className="text-lg mb-3">Search Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• You must fill in at least one search field</li>
            <li>• Combine multiple filters for more specific results</li>
            <li>• Year range is inclusive on both ends</li>
            <li>• Subject search will match books in that category</li>
            <li>
              • Language codes: English (eng), Spanish (spa), French (fre), etc.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
