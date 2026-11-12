import Editor, { loader } from '@monaco-editor/react'
import type { Language } from '../content/types.ts'
import { MONACO_CDN_PATH } from '../editorConfig.ts'
import { useTheme } from '../theme/themeContext.ts'
import styles from './CodeEditor.module.css'

// Must run before the first editor mounts.
loader.config({ paths: { vs: MONACO_CDN_PATH } })

const MONACO_LANGUAGE: Record<Language, string> = { js: 'javascript', python: 'python' }

interface CodeEditorProps {
  /** Identifies the file, so each file keeps its own undo history. */
  path: string
  language: Language
  value: string
  onChange: (value: string) => void
}

export function CodeEditor({ path, language, value, onChange }: CodeEditorProps) {
  const { theme } = useTheme()

  return (
    <div className={styles.wrapper}>
      <Editor
        path={path}
        language={MONACO_LANGUAGE[language]}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(next) => onChange(next ?? '')}
        loading={<p className={styles.loading}>Loading the editor…</p>}
        options={{
          ariaLabel: 'Code editor',
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: language === 'python' ? 4 : 2,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 8 },
          // No autocomplete pop-ups: the editor should not hand out answers for free.
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: 'off',
          parameterHints: { enabled: false },
        }}
      />
    </div>
  )
}
