import type { ReviewRule } from '../content/types.ts'

/**
 * A rule fires when the player's code matches its pattern (or does NOT match, if the rule
 * says `matches: false`).
 */
export function ruleFires(rule: ReviewRule, code: string): boolean {
  return new RegExp(rule.pattern).test(code) === rule.matches
}

export function firedRules(rules: ReviewRule[], code: string): ReviewRule[] {
  return rules.filter((rule) => ruleFires(rule, code))
}
