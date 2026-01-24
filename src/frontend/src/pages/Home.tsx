import { useEffect, useState } from "react";
import { getRecentChanges } from "../api/openLibrary";
import type {RecentChange} from "../types/openLibrary";
import * as React from "react";

const Home: React.FC = () => {
    const [changes, setChanges] = useState<RecentChange[]>([]);

    useEffect(() => {
        getRecentChanges()
            .then(setChanges)
            .catch(console.error);
    }, []);

    return (
        <div>
            <h1>Recent Library Changes</h1>
            <ul>
                {changes.map((change) => (
                    <li key={change.id}>
                        {change.comment || "No description"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
