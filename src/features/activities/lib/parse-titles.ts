export type ParseActivityTitlesResult = {
  titles: string[];
  error?: string;
};

const MAX_TITLE = 120;
const MAX_ITEMS = 20;

/**
 * Split activity input into titles.
 * Newline-separated only (commas inside a line stay part of the title).
 */
export function parseActivityTitles(raw: string): ParseActivityTitlesResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { titles: [], error: "Isi minimal satu aktivitas." };
  }

  const seen = new Set<string>();
  const titles: string[] = [];

  for (const line of trimmed.split(/\r?\n/)) {
    const title = line.trim().replace(/\s+/g, " ");
    if (!title) continue;

    if (title.length > MAX_TITLE) {
      return {
        titles: [],
        error: `Judul maksimal ${MAX_TITLE} karakter per baris.`,
      };
    }

    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push(title);

    if (titles.length > MAX_ITEMS) {
      return {
        titles: [],
        error: `Maksimal ${MAX_ITEMS} aktivitas sekaligus.`,
      };
    }
  }

  if (titles.length === 0) {
    return { titles: [], error: "Isi minimal satu aktivitas." };
  }

  return { titles };
}
