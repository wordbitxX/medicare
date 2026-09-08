/**
 * Canonical Pakistani mobile normalizer.
 * Accepts: 03XXXXXXXXX, 923XXXXXXXXX, +923XXXXXXXXX, 3XXXXXXXXX
 * Always returns 12-digit 923XXXXXXXXX form (or best-effort digits).
 */
export function normalisePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return (raw || "").trim();
  // 03XXXXXXXXX (11 digits) -> 923XXXXXXXXX
  if (digits.startsWith("0") && digits.length === 11) {
    return "92" + digits.slice(1);
  }
  // 923XXXXXXXXX (12 digits) -> as-is
  if (digits.startsWith("92") && digits.length === 12) {
    return digits;
  }
  // 3XXXXXXXXX (10 digits, leading 3) -> 923XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("3")) {
    return "92" + digits;
  }
  return digits;
}

/** All plausible stored variants of a PK number for DB matching. */
export function phoneVariants(raw: string): string[] {
  const digits = (raw || "").replace(/\D/g, "");
  const canon = normalisePhone(raw);
  const set = new Set<string>();
  if (canon) set.add(canon);
  if (digits) set.add(digits);
  // 0-prefixed local form
  if (canon.startsWith("92") && canon.length === 12) {
    set.add("0" + canon.slice(2));
  }
  // bare 10-digit form
  if (canon.startsWith("92") && canon.length === 12) {
    set.add(canon.slice(2));
  }
  return [...set];
}
