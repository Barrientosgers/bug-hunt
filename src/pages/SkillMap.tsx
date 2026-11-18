import {
  LANGUAGES,
  LANGUAGE_LABELS,
  SKILLS,
  SKILL_LABELS,
  type Skill,
} from '../content/types.ts'
import type { SkillPoints } from '../progress/summary.ts'
import styles from './SkillMap.module.css'

/** Points per skill and language. Skills without a challenge yet say "coming soon". */
export function SkillMap({
  skillPoints,
  availableSkills,
}: {
  skillPoints: SkillPoints
  availableSkills: Skill[]
}) {
  const max = Math.max(
    5,
    ...SKILLS.flatMap((skill) => LANGUAGES.map((l) => skillPoints[skill]?.[l] ?? 0)),
  )

  return (
    <ul className={styles.list}>
      {SKILLS.map((skill) => {
        const available = availableSkills.includes(skill)
        return (
          <li key={skill} className={styles.row} data-available={available}>
            <span className={styles.name}>{SKILL_LABELS[skill]}</span>
            {available ? (
              <div className={styles.bars}>
                {LANGUAGES.map((language) => {
                  const points = skillPoints[skill]?.[language] ?? 0
                  return (
                    <div key={language} className={styles.bar}>
                      <span className={styles.lang}>{LANGUAGE_LABELS[language]}</span>
                      <span className={styles.track} aria-hidden="true">
                        <span
                          className={styles.fill}
                          style={{ width: `${(points / max) * 100}%` }}
                        />
                      </span>
                      <span className={styles.points}>
                        {points} {points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <span className={styles.soon}>Coming soon</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
