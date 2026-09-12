"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    mounted: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
}

export default function ThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    // Must match the server's first render.
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem("b-fresh-theme");

        const resolvedTheme: Theme =
            storedTheme === "light" || storedTheme === "dark"
                ? storedTheme
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? "dark"
                  : "light";

        setTheme(resolvedTheme);
        applyTheme(resolvedTheme);
        localStorage.setItem("b-fresh-theme", resolvedTheme);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        applyTheme(theme);
        localStorage.setItem("b-fresh-theme", theme);
    }, [theme, mounted]);

    function toggleTheme() {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                mounted,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}