/** "1 day", "2 days": the count with the word in the right form. */
export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`
