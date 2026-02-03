import { ExternalLink, BookOpen, AlertCircle } from "lucide-react";
import type { WikipediaCardProps } from "../types/wikipedia";
import type {SyntheticEvent} from "react";

export function WikipediaCard({ data, loading = false, type = "book" }: WikipediaCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-muted rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-background dark:from-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">
              Wikipedia Information Not Available
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              We couldn't find a Wikipedia page for this {type}. This doesn't mean the {type} isn't notable—it may just not have a Wikipedia article yet.
            </p>
            <a
              href={`https://en.wikipedia.org/wiki/Special:Search?search=${type === "book" ? "book" : "author"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              Search Wikipedia manually
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 p-6">
      <div className="flex items-start gap-4">
        {/* Wikipedia Logo / Image */}
        <div className="flex-shrink-0">
          {data.image ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
              <img
                src={data.image}
                alt={data.title || "Wikipedia"}
                className="w-full h-full object-cover"
                onError={(e: SyntheticEvent<HTMLElement, Event>) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                {data.title || "Wikipedia"}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                From Wikipedia, the free encyclopedia
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
            {data.description}
          </p>

          {/* Link */}
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Read full article on Wikipedia
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}