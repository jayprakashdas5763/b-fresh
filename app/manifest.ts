import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "B-Fresh",
    short_name: "B-Fresh",
    description:
      "Fresh food and quality dairy products delivered to your doorstep.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#15803d",
    orientation: "portrait",
    icons: [
  {
    src: "/images/icon-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/images/icon-512.png",
    sizes: "512x512",
    type: "image/png",
  },
],
  };
}