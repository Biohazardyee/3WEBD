export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  subjects: string[];
  language: string;
  isbn?: string;
  coverUrl: string;
  description: string;
  publisher?: string;
  pages?: number;
  dateAdded: string;
}

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: 1960,
    subjects: ["Fiction", "Classic Literature", "American Literature"],
    language: "English",
    isbn: "978-0-06-112008-4",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    description: "A gripping tale of racial injustice and childhood innocence in the Depression-era South.",
    publisher: "J.B. Lippincott & Co.",
    pages: 324,
    dateAdded: "2026-01-20"
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    year: 1949,
    subjects: ["Fiction", "Dystopian", "Political Fiction"],
    language: "English",
    isbn: "978-0-452-28423-4",
    coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    description: "A dystopian social science fiction novel exploring themes of totalitarianism and surveillance.",
    publisher: "Secker & Warburg",
    pages: 328,
    dateAdded: "2026-01-18"
  },
  {
    id: "3",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    subjects: ["Fiction", "Romance", "Classic Literature"],
    language: "English",
    isbn: "978-0-14-143951-8",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    description: "A romantic novel of manners that follows the character development of Elizabeth Bennet.",
    publisher: "T. Egerton",
    pages: 432,
    dateAdded: "2026-01-15"
  },
  {
    id: "4",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    subjects: ["Fiction", "Classic Literature", "American Literature"],
    language: "English",
    isbn: "978-0-7432-7356-5",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop",
    description: "A novel that captures the spirit of the Jazz Age and American dream.",
    publisher: "Charles Scribner's Sons",
    pages: 180,
    dateAdded: "2026-01-12"
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    year: 1951,
    subjects: ["Fiction", "Coming of Age", "American Literature"],
    language: "English",
    isbn: "978-0-316-76948-0",
    coverUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    description: "A story of teenage rebellion and alienation narrated by Holden Caulfield.",
    publisher: "Little, Brown and Company",
    pages: 277,
    dateAdded: "2026-01-10"
  },
  {
    id: "6",
    title: "Brave New World",
    author: "Aldous Huxley",
    year: 1932,
    subjects: ["Fiction", "Dystopian", "Science Fiction"],
    language: "English",
    isbn: "978-0-06-085052-4",
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    description: "A dystopian novel set in a futuristic World State of genetically modified citizens.",
    publisher: "Chatto & Windus",
    pages: 288,
    dateAdded: "2026-01-08"
  },
  {
    id: "7",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    subjects: ["Fantasy", "Adventure", "Fiction"],
    language: "English",
    isbn: "978-0-618-00221-3",
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop",
    description: "A fantasy novel about the adventures of Bilbo Baggins in Middle-earth.",
    publisher: "George Allen & Unwin",
    pages: 310,
    dateAdded: "2026-01-05"
  },
  {
    id: "8",
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    year: 1847,
    subjects: ["Fiction", "Romance", "Gothic", "Classic Literature"],
    language: "English",
    isbn: "978-0-14-144114-6",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    description: "A bildungsroman following the experiences of its eponymous heroine.",
    publisher: "Smith, Elder & Co.",
    pages: 507,
    dateAdded: "2026-01-03"
  }
];
