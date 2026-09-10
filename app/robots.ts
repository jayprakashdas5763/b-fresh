import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/admin/",
                "/account/",
                "/cart/",
                "/checkout/",
                "/orders/",
                "/wishlist/",
                "/notifications/",
                "/auth/",
            ],
        },
        sitemap: "http://localhost:3000/sitemap.xml",
    };
}