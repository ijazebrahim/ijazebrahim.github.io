import React, { createContext, useState, useContext } from 'react';

const GridContext = createContext();

export const GridProvider = ({ children }) => {
    const [isGridChanged, setIsGridChanged] = useState(false);
    const [attemptNavigation, setAttemptNavigation] = useState(false);

    const handleAttemptedNavigation = () => {
        if (isGridChanged) {
            setAttemptNavigation(true);
        }
    };

    return (
        <GridContext.Provider value={{ isGridChanged, setIsGridChanged, handleAttemptedNavigation, attemptNavigation, setAttemptNavigation }}>
            {children}
        </GridContext.Provider>
    );
};

export const useGridContext = () => useContext(GridContext);
