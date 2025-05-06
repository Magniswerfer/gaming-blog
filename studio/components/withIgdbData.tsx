import React, { useEffect, useState } from "react";
import IgdbDataButton from "./IgdbDataButton.tsx";

// Define a global interface for the CustomEvent type
declare global {
    interface WindowEventMap {
        "igdb:gameSelected": CustomEvent<{ gameId: number; gameTitle: string }>;
        "igdb:gameReset": CustomEvent;
    }
}

// Higher-order component to add IGDB data button to Sanity fields
export function withIgdbData(fieldType: string) {
    return function WithIgdbData(props: any) {
        const { renderDefault, parent, onChange, ...rest } = props;
        const [gameTitle, setGameTitle] = useState<string>(parent?.title || "");

        // Listen for game selection events
        useEffect(() => {
            // Initial setup
            setGameTitle(parent?.title || "");

            // Try to get the game title from localStorage
            if (!parent?.title && typeof localStorage !== "undefined") {
                const storedTitle = localStorage.getItem(
                    "igdb:selectedGameTitle",
                );
                if (storedTitle) {
                    setGameTitle(storedTitle);
                }
            }

            // Update game title when parent changes
            if (parent?.title) {
                setGameTitle(parent.title);
            }
        }, [parent?.title]);

        return (
            <div style={{ position: "relative" }}>
                {renderDefault({ ...props })}
                <div style={{ position: "absolute", top: 0, right: 0 }}>
                    <IgdbDataButton
                        gameTitle={gameTitle}
                        fieldType={fieldType as any}
                        onChange={onChange}
                    />
                </div>
            </div>
        );
    };
}

export default withIgdbData;
