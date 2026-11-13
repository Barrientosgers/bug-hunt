export interface Rank {
  name: string
  minXp: number
}

export const RANKS: readonly Rank[] = [
  { name: 'Intern', minXp: 0 },
  { name: 'Junior', minXp: 50 },
  { name: 'Mid-level', minXp: 150 },
  { name: 'Senior', minXp: 350 },
  { name: 'Staff', minXp: 700 },
  { name: 'Bug Hunter', minXp: 1200 },
]

export interface RankInfo {
  rank: Rank
  next: Rank | null
  /** XP earned since reaching this rank. */
  xpIntoRank: number
  /** XP between this rank and the next (0 at the top rank). */
  xpSpan: number
  /** 0 to 1 progress toward the next rank (1 at the top). */
  progress: number
}

export function rankFor(xp: number): RankInfo {
  let index = 0
  RANKS.forEach((rank, i) => {
    if (xp >= rank.minXp) index = i
  })
  const rank = RANKS[index]
  const next = RANKS[index + 1] ?? null
  const xpIntoRank = xp - rank.minXp
  const xpSpan = next ? next.minXp - rank.minXp : 0
  return { rank, next, xpIntoRank, xpSpan, progress: next ? xpIntoRank / xpSpan : 1 }
}
