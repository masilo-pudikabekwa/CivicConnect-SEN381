/**
 * ==============================================================================
 * Report Reference Generation (FR-03)
 *
 * Traceability:
 *   - FR-03: unique, human-readable tracking reference
 *   - TD-04 / CR-013: replaces CC-YYYYMMDD-NNNN (9,000 values per day, ~50%
 *     collision chance after ~112 reports) with 6 characters from a
 *     32-symbol alphabet (~1.07 billion values per day)
 * ==============================================================================
 */

import { randomBytes } from "node:crypto";

// 32 symbols; 0/O and 1/I are left out so citizens can read references back safely
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 6;

/** Shape every generated reference must match (used by tests). */
export const REFERENCE_PATTERN = /^CC-\d{8}-[A-HJ-NP-Z2-9]{6}$/;

/**
 * Format: CC-YYYYMMDD-XXXXXX (UTC date).
 * 256 is a multiple of 32, so `byte % 32` picks every symbol with equal probability.
 */
export function generateReference(now: Date = new Date()): string {
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  let suffix = "";
  for (const byte of randomBytes(SUFFIX_LENGTH)) {
    suffix += ALPHABET[byte % ALPHABET.length];
  }
  return `CC-${dateStr}-${suffix}`;
}
