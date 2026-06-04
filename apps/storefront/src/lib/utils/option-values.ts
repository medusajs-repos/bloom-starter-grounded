/**
 * Utilities for handling the option-value filter introduced together with
 * global product options (Medusa core PR #13817).
 */

export const OPTION_VALUE_QUERY_KEY = "optionValueIds"

type SearchParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined
  | null

const dedupe = (arr: string[]): string[] => Array.from(new Set(arr.filter(Boolean)))

/**
 * Parse `optionValueIds` from a URLSearchParams or a server-side searchParams
 * record. Supports comma-separated string fallback and repeated keys. Returns
 * a deduplicated array.
 */
export const parseOptionValueIds = (input: SearchParamsLike): string[] => {
  if (!input) {
    return []
  }

  if (input instanceof URLSearchParams) {
    const all = input.getAll(OPTION_VALUE_QUERY_KEY)
    const flat = all.flatMap((v) => v.split(","))
    return dedupe(flat.map((v) => v.trim()))
  }

  const raw = (input as Record<string, string | string[] | undefined>)[OPTION_VALUE_QUERY_KEY]
  if (raw == null) {
    return []
  }
  if (Array.isArray(raw)) {
    return dedupe(raw.flatMap((v) => v.split(",")).map((v) => v.trim()))
  }
  return dedupe(raw.split(",").map((v) => v.trim()))
}

/**
 * Serialize an array of option-value IDs into a comma-separated string suitable
 * for placement in a URL query string. Returns null when there are no IDs.
 */
export const serializeOptionValueIds = (ids: string[]): string | null => {
  const deduped = dedupe(ids)
  return deduped.length > 0 ? deduped.join(",") : null
}
