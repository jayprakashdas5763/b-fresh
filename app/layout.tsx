import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),

    title: {
        default: "B-Fresh | Fresh Food & Dairy Delivered",
        template: "%s | B-Fresh",
    },

    description:
        "B-Fresh delivers fresh food and quality dairy products to your doorstep in Odisha.",

    keywords: [
        "B-Fresh",
        "fresh food",
        "dairy products",
        "milk delivery",
        "fresh milk",
        "online grocery",
        "Odisha",
    ],

    authors: [
        {
            name: "B-Fresh",
        },
    ],

    creator: "B-Fresh",
    publisher: "B-Fresh",

    robots: {
        index: true,
        follow: true,
    },

    openGraph: {
        type: "website",
        siteName: "B-Fresh",
        title: "B-Fresh | Fresh Food & Dairy Delivered",
        description:
            "Fresh food and quality dairy products delivered to your doorstep.",
        locale: "en_IN",
    },

    twitter: {
        card: "summary_large_image",
        title: "B-Fresh | Fresh Food & Dairy Delivered",
        description:
            "Fresh food and quality dairy products delivered to your doorstep.",
    },
};

const themeScript = `
(function () {
    try {
        var stored = localStorage.getItem("b-fresh-theme");

        var theme =
            stored === "light" || stored === "dark"
                ? stored
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";

        document.documentElement.classList.toggle(
            "dark",
            theme === "dark"
        );

        document.documentElement.style.colorScheme = theme;
    } catch (error) {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
    }
})();
`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: themeScript,
                    }}
                />
            </head>

            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}