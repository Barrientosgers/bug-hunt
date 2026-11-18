import { LANGUAGE_LABELS, type Language } from '../content/types.ts'
import { formatDuration } from '../game/timer.ts'

/** Where players are sent from a shared result (live after the Phase 7 deploy). */
export const SITE_URL = 'https://barrientosgers.github.io/bug-hunt/'

/**
 * One letter per run: r = no progress, y = more tests passing than ever before, g = solved.
 * `passedPerRun` holds how many required tests passed in each run, oldest first.
 */
export function trailFrom(passedPerRun: number[], totalRequired: number): string {
  let best = 0
  return passedPerRun
    .map((passed) => {
      if (passed >= totalRequired) return 'g'
      if (passed > best) {
        best = passed
        return 'y'
      }
      return 'r'
    })
    .join('')
}

const SQUARE: Record<string, string> = { r: '🟥', y: '🟨', g: '🟩' }

export const trailEmoji = (trail: string) =>
  [...trail].map((c) => SQUARE[c] ?? '').join('')

export interface ShareInput {
  number: number
  language: Language
  trail: string | undefined
  runs: number
  elapsedMs: number
  hintsUsed: number
  journal: boolean
  bonus: boolean
  streak: number
  rankName: string
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

/**
 * The text a player shares. It has no spoilers on purpose: no code, no bug title, no hint
 * text. Only how the hunt went.
 */
export function buildShareText(input: ShareInput): string {
  const squares = input.trail ? trailEmoji(input.trail) : '🟩'
  const details = [
    `⏱ ${formatDuration(input.elapsedMs)}`,
    `💡 ${plural(input.hintsUsed, 'hint')}`,
    ...(input.journal ? ['📓 journal'] : []),
    ...(input.bonus ? ['⭐ bonus'] : []),
  ]
  const standing = [
    ...(input.streak >= 2 ? [`🔥 ${input.streak}-day streak`] : []),
    input.rankName,
  ]
  return [
    `Bug Hunt #${String(input.number).padStart(3, '0')} 🐞 ${LANGUAGE_LABELS[input.language]}`,
    `${squares}  ${plural(input.runs, 'run')}`,
    details.join(' · '),
    standing.join(' · '),
    SITE_URL,
  ].join('\n')
}
