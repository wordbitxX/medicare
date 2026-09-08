import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medicare Plus",
    short_name: "Medicare Plus",
    description:
      "Specialist healthcare, diagnostics and online appointment booking in Lahore, Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#071a2c",
    categories: ["health", "medical", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
