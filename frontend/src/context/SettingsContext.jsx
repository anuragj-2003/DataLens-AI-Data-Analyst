import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // Load from localStorage or defaults
    const [model, setModel] = useState(localStorage.getItem('model') || "llama-3.3-70b-versatile");
    const [systemPrompt, setSystemPrompt] = useState(localStorage.getItem('systemPrompt') || "You are a helpful AI assistant.");
    const [temperature, setTemperature] = useState(parseFloat(localStorage.getItem('temperature')) || 0.7);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || "system");

    // Persist changes
    useEffect(() => {
        localStorage.setItem('model', model);
        localStorage.setItem('systemPrompt', systemPrompt);
        localStorage.setItem('temperature', temperature);
        localStorage.setItem('theme', theme);
    }, [model, systemPrompt, temperature, theme]);

    // Apply Theme
    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            // Remove previous classes
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.add('light'); // Optional specific light class
                }
            } else {
                root.classList.add(theme); // 'dark' or 'light'
            }
        };

        applyTheme();

        // Listen for system changes if mode is 'system'
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemChange = () => {
            if (theme === 'system') applyTheme();
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, [theme]);

    return (
        <SettingsContext.Provider value={{
            model, setModel,
            systemPrompt, setSystemPrompt,
            temperature, setTemperature,
            theme, setTheme
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
