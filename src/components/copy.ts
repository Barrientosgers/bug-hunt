/**
 * Copies text to the clipboard. Returns false when that is not possible (blocked by the
 * browser, or not a secure page), so the caller can show the text to copy by hand.
 */
export async function copyText(
  text: string,
  clipboard?: Pick<Clipboard, 'writeText'>,
): Promise<boolean> {
  try {
    const target = clipboard ?? navigator.clipboard
    if (!target) return false
    await target.writeText(text)
    return true
  } catch {
    return false
  }
}
