import type { Challenge, Hypothesis, Language } from '../content/types.ts'
import type { JournalEntry, JournalState } from '../game/journal.ts'
import type { ResultSummary } from '../game/results.ts'
import { diffStats } from './diff.ts'
import { firedRules } from './rules.ts'

/** 'strong' = something to be proud of, 'note' = something worth a look. Never "bad". */
export type Verdict = 'strong' | 'note'

export interface ReviewSection {
  id: string
  title: string
  verdict?: Verdict
  paragraphs: string[]
}

export interface Review {
  headline: string
  sections: ReviewSection[]
  /** The one thing to keep. */
  lesson: string
}

export interface ReviewInput {
  challenge: Challenge
  language: Language
  /** The buggy code the player started from. */
  starterCode: string
  /** The code that passed the tests. */
  finalCode: string
  summary: ResultSummary
  journal: JournalState
  hintsUsed: number
  /** Test runs it took, including the one that solved it. */
  runs: number
}

export type HypothesisMatch = 'good' | 'partial' | 'miss'

/** Crude keyword matching: does the guess mention where, and why? */
export function matchHypothesis(
  entry: Pick<JournalEntry, 'where' | 'because'>,
  keywords: Pick<Hypothesis, 'where' | 'why'>,
): HypothesisMatch {
  const text = `${entry.where} ${entry.because}`.toLowerCase()
  const mentions = (words: string[]) =>
    words.some((word) => text.includes(word.toLowerCase()))
  const whereHit = mentions(keywords.where)
  const whyHit = mentions(keywords.why)
  if (whereHit && whyHit) return 'good'
  return whereHit || whyHit ? 'partial' : 'miss'
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`

function rootCauseSection(input: ReviewInput): ReviewSection {
  const rules = input.challenge.languages[input.language]?.reviewRules ?? []
  const fired = firedRules(rules, input.finalCode)
  const rootCause = fired.find((rule) => rule.kind === 'root-cause')
  const symptom = fired.find((rule) => rule.kind === 'symptom')

  if (rootCause) {
    return {
      id: 'root-cause',
      title: 'Root cause or symptom?',
      verdict: 'strong',
      paragraphs: [rootCause.feedback],
    }
  }
  return {
    id: 'root-cause',
    title: 'Root cause or symptom?',
    verdict: 'note',
    paragraphs: [
      symptom?.feedback ??
        'The tests pass. Walk through your change out loud and explain why it fixes the real cause.',
    ],
  }
}

function minimalChangeSection(input: ReviewInput): ReviewSection {
  const max = input.challenge.languages[input.language]?.minimalChange.maxLines ?? 1
  const changed = diffStats(input.starterCode, input.finalCode).changed
  if (changed <= max) {
    return {
      id: 'minimal-change',
      title: 'Was the change minimal?',
      verdict: 'strong',
      paragraphs: [
        `You changed ${plural(changed, 'line')}. A small, focused fix is easy to review and unlikely to break anything else. Well done.`,
      ],
    }
  }
  return {
    id: 'minimal-change',
    title: 'Was the change minimal?',
    verdict: 'note',
    paragraphs: [
      `You changed ${plural(changed, 'line')}, which is more than this bug needs. Try this next time: once you know the cause, ask what the smallest change is that fixes it. Smaller changes are easier to review and less likely to break something else.`,
    ],
  }
}

function bonusSection(input: ReviewInput): ReviewSection {
  const rules = input.challenge.languages[input.language]?.reviewRules ?? []
  const fired = firedRules(rules, input.finalCode)
  const found = fired.find((rule) => rule.kind === 'bonus')
  const tip = fired.find((rule) => rule.kind === 'tip')
  if (found) {
    return {
      id: 'bonus',
      title: 'Bonus finds',
      verdict: 'strong',
      paragraphs: [found.feedback],
    }
  }
  return {
    id: 'bonus',
    title: 'Bonus finds',
    verdict: 'note',
    paragraphs: [tip?.feedback ?? input.challenge.bonusTests],
  }
}

function hypothesisSection(input: ReviewInput): ReviewSection {
  const { hypothesis } = input.challenge
  if (input.journal.status !== 'written') {
    return {
      id: 'hypothesis',
      title: 'Your hypothesis',
      verdict: 'note',
      paragraphs: [hypothesis.skipped],
    }
  }
  const { entry } = input.journal
  const match = matchHypothesis(entry, hypothesis)
  return {
    id: 'hypothesis',
    title: 'Your hypothesis',
    verdict: match === 'good' ? 'strong' : 'note',
    paragraphs: [
      `You wrote: “I think the bug is in ${entry.where} because ${entry.because}.”`,
      hypothesis[match],
    ],
  }
}

function processSection(input: ReviewInput): ReviewSection {
  const notes: string[] = []
  if (input.journal.status === 'written' && input.journal.entry.beforeFirstRun) {
    notes.push(
      'You wrote your hypothesis before running anything. Forming a guess first is the habit that separates debugging from guessing.',
    )
  }
  if (input.hintsUsed === 0) {
    notes.push('You solved it without any hints.')
  } else {
    notes.push(
      `You used ${plural(input.hintsUsed, 'hint')}. Asking for help when you are stuck is a skill, not a weakness, and every working developer does it.`,
    )
  }
  notes.push(
    input.runs <= 2
      ? `You solved it in ${plural(input.runs, 'run')}: you read the evidence before changing things.`
      : `It took ${input.runs} runs, and that is normal. Each run told you something new about the bug.`,
  )
  return { id: 'process', title: 'Your process', verdict: 'strong', paragraphs: notes }
}

/** Priya's review of a solved challenge. Pure: the same inputs always give the same review. */
export function buildReview(input: ReviewInput): Review {
  const { challenge } = input
  return {
    headline: 'Nice work, all the required tests pass. Here is my review of your fix.',
    sections: [
      rootCauseSection(input),
      minimalChangeSection(input),
      bonusSection(input),
      hypothesisSection(input),
      processSection(input),
      {
        id: 'prevent',
        title: 'How to prevent it next time',
        paragraphs: [challenge.howToPrevent],
      },
      {
        id: 'work',
        title: 'Where this shows up at work',
        paragraphs: [challenge.whereItShowsUpAtWork],
      },
    ],
    lesson: challenge.lesson,
  }
}
