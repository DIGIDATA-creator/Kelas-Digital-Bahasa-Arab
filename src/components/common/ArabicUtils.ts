/**
 * Converts a standard integer or string number to Eastern Arabic numerals (١, ٢, ٣...)
 */
export function toArabicNumber(num: number | string): string {
  const numStr = num.toString();
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return numStr.replace(/\d/g, (digit) => arabicDigits[parseInt(digit, 10)]);
}

/**
 * Parses raw CSV or spreadsheet text into VocabularyItems
 * Format supported:
 * Teks Arab, Terjemahan
 * or Teks Arab | Terjemahan
 * or Teks Arab \t Terjemahan
 */
export function parseSpreadsheetText(text: string): { word: string; meaning: string }[] {
  const lines = text.split(/\r?\n/);
  const items: { word: string; meaning: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let parts = trimmed.split('\t');
    if (parts.length < 2) parts = trimmed.split(',');
    if (parts.length < 2) parts = trimmed.split('|');

    if (parts.length >= 2) {
      const word = parts[0].trim();
      const meaning = parts[1].trim();
      if (word && meaning) {
        items.push({ word, meaning });
      }
    }
  }

  return items;
}
