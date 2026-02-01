import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { AdvancedSearchPage } from "./pages/AdvancedSearchPage";
import { SearchResultsPage } from "./pages/SearchResultPage";
import { BookDetailPage } from "./pages/BookDetailPage";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/advanced-search" element={<AdvancedSearchPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/book/*" element={<BookDetailPage />} />
      </Routes>
      <Footer />
    </>
  );
}