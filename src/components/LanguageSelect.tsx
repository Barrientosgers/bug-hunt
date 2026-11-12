import { useId } from 'react'
import { LANGUAGE_LABELS, type Language } from '../content/types.ts'
import styles from './LanguageSelect.module.css'

interface LanguageSelectProps {
  languages: Language[]
  value: Language
  onChange: (language: Language) => void
}

export function LanguageSelect({ languages, value, onChange }: LanguageSelectProps) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id}>Language</label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as Language)}
      >
        {languages.map((language) => (
          <option key={language} value={language}>
            {LANGUAGE_LABELS[language]}
          </option>
        ))}
      </select>
    </div>
  )
}
