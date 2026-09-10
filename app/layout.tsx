import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}