import { buildHeatmap, describeHeatmap } from '../progress/heatmap.ts'
import styles from './Heatmap.module.css'

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

/** Solved days as a grid. Each day has a text tooltip; the whole grid has a text summary. */
export function Heatmap({
  solvesPerDay,
  today,
}: {
  solvesPerDay: Record<string, number>
  today: string
}) {
  const grid = buildHeatmap(solvesPerDay, today)
  const summary = describeHeatmap(grid)

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.summary}>{summary}</figcaption>
      <div className={styles.wrap}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <ul className={styles.grid} aria-label="Solved days, oldest week first">
          {grid.map((week) => (
            <li key={week[0].day} className={styles.week}>
              <ul className={styles.days}>
                {week.map((cell) => (
                  <li
                    key={cell.day}
                    className={styles.cell}
                    data-level={cell.level}
                    data-future={cell.future || undefined}
                    title={cell.future ? undefined : `${cell.day}: ${cell.count} solved`}
                  >
                    {!cell.future && (
                      <span className={styles.sr}>
                        {cell.day}: {cell.count} solved
                      </span>
                    )}
                    {cell.count > 0 && (
                      <span className={styles.count} aria-hidden="true">
                        {cell.count}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.legend} aria-hidden="true">
        Less
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className={styles.cell} data-level={level} />
        ))}
        More
      </div>
    </figure>
  )
}
