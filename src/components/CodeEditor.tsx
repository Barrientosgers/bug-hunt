import Editor, { loader, type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'react'
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
  /** Called when the player presses Ctrl+Enter (Cmd+Enter on a Mac). */
  onRun: () => void
}

export function CodeEditor({ path, language, value, onChange, onRun }: CodeEditorProps) {
  const { theme } = useTheme()
  // The shortcut is registered once, so it reads the latest onRun through a ref.
  const onRunRef = useRef(onRun)
  useEffect(() => {
    onRunRef.current = onRun
  })

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      onRunRef.current(),
    )
  }

  return (
    <div className={styles.wrapper}>
      <Editor
        path={path}
        language={MONACO_LANGUAGE[language]}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(next) => onChange(next ?? '')}
        onMount={handleMount}
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
