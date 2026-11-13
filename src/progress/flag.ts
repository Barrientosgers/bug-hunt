import type { Language } from '../content/types.ts'

// No 0/o/1/l/i, so a flag is never misread when copied by hand.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const LANGUAGE_CODE: Record<Language, string> = { js: 'js', python: 'py' }

export const FLAG_PATTERN = /^BUGHUNT\{snackr-\d{3,}-(js|py)-[a-z2-9]{6}\}$/

function randomBytes(count: number): number[] {
  return [...crypto.getRandomValues(new Uint8Array(count))]
}

/**
 * A flag like BUGHUNT{snackr-001-js-k7m2qx}. In the MVP it is made in the browser, so it
 * only marks personal progress and cannot be trusted by a leaderboard. Later, a server that
 * re-runs the official tests will issue signed flags.
 */
export function generateFlag(
  number: number,
  language: Language,
  random: (count: number) => number[] = randomBytes,
): string {
  const suffix = random(6)
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join('')
  return `BUGHUNT{snackr-${String(number).padStart(3, '0')}-${LANGUAGE_CODE[language]}-${suffix}}`
}
