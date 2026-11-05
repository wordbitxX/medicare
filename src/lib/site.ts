// Single source of truth for this demo's own canonical URL.
//
// This demo is live at https://medicare.wordbitx.pk. Every canonical tag,
// og:url, sitemap entry and JSON-LD @id must be self-referencing on that
// host, so the fallback below is the demo's own domain — never a third-party
// or retired domain. Set NEXT_PUBLIC_SITE_URL only to point the same build at
// a staging/preview host.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://medicare.wordbitx.pk").replace(
  /\/$/,
  ""
);
