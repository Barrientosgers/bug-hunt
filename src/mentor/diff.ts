export interface DiffStats {
  added: number
  removed: number
  /** How many lines were touched: a replaced line counts once. */
  changed: number
}

/** Lines without leading/trailing spaces, ignoring blank lines. */
function normalize(code: string): string[] {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Compares two versions of the code line by line (longest common subsequence), ignoring
 * indentation and blank lines. Used to tell a small, focused fix from a big rewrite.
 */
export function diffStats(before: string, after: string): DiffStats {
  const a = normalize(before)
  const b = normalize(after)

  // lengths[i][j] = length of the longest common subsequence of a[i..] and b[j..]
  const lengths = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  )
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }
  const common = lengths[0][0]
  const removed = a.length - common
  const added = b.length - common
  return { added, removed, changed: Math.max(added, removed) }
}
