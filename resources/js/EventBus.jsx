import React from "react";

// Create the context
export const EventBusContext = React.createContext();

// Provider component
export const EventBusProvider = ({ children }) => {
    const events = React.useRef({}); // ✅ useRef keeps listeners stable across renders

    // Emit an event
    const emit = (name, data) => {
        if (events.current[name]) {
            for (let cb of events.current[name]) {
                cb(data);
            }
        }
    };

    // Subscribe to an event
    const on = (name, cb) => {
        if (!events.current[name]) {
            events.current[name] = [];
        }
        events.current[name].push(cb);

        // Return unsubscribe function
        return () => {
            events.current[name] = events.current[name].filter(
                (callback) => callback !== cb
            );
        };
    };

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

// Hook to use the event bus
export const useEventBus = () => {
    const context = React.useContext(EventBusContext);
    if (!context) {
        throw new Error("useEventBus must be used within an EventBusProvider");
    }
    return context;
};
