import { Link } from "react-router-dom";
import type { Book } from "../data/mockBooks";
import { Calendar, User } from "lucide-react";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      to={`/book/${book.id}`}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {book.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="truncate">{book.author}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{book.year}</span>
        </div>
      </div>
    </Link>
  );
}
