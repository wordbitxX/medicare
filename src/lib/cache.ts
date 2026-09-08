export const PUBLIC_CACHE_SECONDS = 60;
export const PUBLIC_STALE_SECONDS = 300;

export function publicCacheHeaders(seconds = PUBLIC_CACHE_SECONDS) {
  return {
    "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${PUBLIC_STALE_SECONDS}`,
  };
}

export function privateNoStoreHeaders() {
  return { "Cache-Control": "private, no-store, max-age=0" };
}
