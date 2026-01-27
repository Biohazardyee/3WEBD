import { Link } from "react-router-dom";
import type { Book } from "../data/mockBooks";
import { Calendar, User } from "lucide-react";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const bookPath = book.id.startsWith("/") ? book.id.slice(1) : book.id;

  return (
    <Link to={`/book/${bookPath}`} className="group block">
      <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-muted mb-3">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {book.title}
      </h3>
      <p className="text-xs text-muted-foreground">{book.author}</p>
    </Link>
  );
}
