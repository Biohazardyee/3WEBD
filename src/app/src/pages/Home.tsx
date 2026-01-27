import { useEffect, useState } from "react";
import { getRecentChanges, getBookByKey } from "../api/openLibrary";
// On importe bien EnrichedChange ici
import type { RecentChange, EnrichedChange } from "../types/openLibrary";
import * as React from "react";
import Header from "../components/Header";
import "./Home.css";

const Home: React.FC = () => {
    // CORRECTION : On utilise EnrichedChange[] pour que TS accepte bookData
    const [changes, setChanges] = useState<EnrichedChange[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrichedChanges = async () => {
            try {
                const rawChanges: RecentChange[] = await getRecentChanges();

                const enriched: EnrichedChange[] = await Promise.all(
                    rawChanges.map(async (change) => {
                        // "entities" est maintenant reconnu grâce à la mise à jour de l'interface
                        const bookKey = change.entities?.find((e) =>
                            e.startsWith("/works/"),
                        );

                        if (bookKey) {
                            try {
                                const bookData = await getBookByKey(bookKey);
                                return { ...change, bookData };
                            } catch (err) {
                                console.error(`Failed to fetch book ${bookKey}`, err);
                                return change;
                            }
                        }
                        return change;
                    }),
                );
                setChanges(enriched);
            } catch (error) {
                console.error(`Error fetching changes:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrichedChanges();
    }, []);

    return (
        <div className="home-page">
            <Header />
            <div className="home-content">
                <div className="page-header">
                    <h1 className="page-title">📖 Recent Library Changes</h1>
                    <p className="page-subtitle">
                        Discover the latest updates in our library
                    </p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loader"></div>
                        <p>Loading changes...</p>
                    </div>
                ) : (
                    <div className="changes-grid">
                        {changes.length > 0 ? (
                            changes.map((change) => (
                                <div key={change.id} className="change-card">
                                    {change.bookData && (
                                        <div className="book-info-preview">
                                            {change.bookData.covers && change.bookData.covers.length > 0 && (
                                                <img
                                                    src={`https://covers.openlibrary.org/b/id/${change.bookData.covers[0]}-S.jpg`}
                                                    alt={change.bookData.title}
                                                    className="book-thumbnail"
                                                />
                                            )}
                                            <div className="book-text">
                                                <h4 className="book-title">{change.bookData.title}</h4>
                                                <span className="book-key">{change.bookData.key}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="card-body">
                                        <p className="change-description">
                                            <strong>Action:</strong> {change.comment || "No description provided"}
                                        </p>
                                    </div>

                                    <div className="card-footer">
                                        {/* "timestamp" est maintenant accessible sans erreur TS */}
                                        <span className="change-date">
                                            {change.timestamp 
                                                ? new Date(change.timestamp).toLocaleDateString() 
                                                : "Unknown date"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>No changes found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;