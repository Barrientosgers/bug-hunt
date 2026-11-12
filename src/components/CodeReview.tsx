import type { Review } from '../mentor/review.ts'
import { Bubble } from './Bubble.tsx'
import styles from './CodeReview.module.css'

/** Priya's code review. Every verdict has an icon AND words, never color alone. */
export function CodeReview({ review }: { review: Review }) {
  return (
    <div>
      <Bubble character="priya">
        <p>{review.headline}</p>
      </Bubble>

      {review.sections.map((section) => (
        <section
          key={section.id}
          className={styles.section}
          aria-labelledby={`review-${section.id}`}
        >
          <h4 id={`review-${section.id}`} className={styles.title}>
            {section.title}
            {section.verdict && (
              <span className={styles.verdict} data-verdict={section.verdict}>
                {section.verdict === 'strong' ? '✓ Strong' : '💡 Worth a look'}
              </span>
            )}
          </h4>
          {section.paragraphs.map((text, index) => (
            <p key={index} className={styles.text}>
              {text}
            </p>
          ))}
        </section>
      ))}

      <section className={styles.lesson} aria-labelledby="review-lesson">
        <h4 id="review-lesson" className={styles.title}>
          <span aria-hidden="true">📌 </span>One lesson to keep
        </h4>
        <p className={styles.text}>{review.lesson}</p>
      </section>
    </div>
  )
}
