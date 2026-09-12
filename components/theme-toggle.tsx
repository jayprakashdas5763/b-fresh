"use client";

import { useTheme } from "@/components/theme-provider";

function SunIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.42 1.42" />
            <path d="m17.65 17.65 1.42 1.42" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m4.93 19.07 1.42-1.42" />
            <path d="m17.65 6.35 1.42-1.42" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
        >
            <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.8 8.8 0 1 0 11.5 11.5Z" />
        </svg>
    );
}

export default function ThemeToggle() {
    const { theme, mounted, toggleTheme } = useTheme();

    if (!mounted) {
        return (
            <span
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-[#fffdf7] shadow-sm dark:border-green-800 dark:bg-green-950"
            >
                <span className="h-[18px] w-[18px] rounded-full bg-green-100 dark:bg-green-900" />
            </span>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-[#fffdf7] text-green-800 shadow-sm transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:border-green-800 dark:bg-green-950 dark:text-lime-300 dark:hover:bg-green-900 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
        >
            {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}