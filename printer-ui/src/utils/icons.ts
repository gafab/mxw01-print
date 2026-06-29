import type { IconEntry } from '../types';

let cachedIcons: IconEntry[] | null = null;

function camelToReadable(name: string): string {
  // "mdiAccountCircle" -> "account circle"
  return name
    .replace(/^mdi/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();
}

export async function getIconList(): Promise<IconEntry[]> {
  if (cachedIcons) return cachedIcons;

  const mdiModule = await import('@mdi/js');
  const entries: IconEntry[] = [];

  for (const [key, value] of Object.entries(mdiModule)) {
    if (key.startsWith('mdi') && typeof value === 'string' && value.startsWith('M')) {
      entries.push({
        name: camelToReadable(key),
        path: value,
      });
    }
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  cachedIcons = entries;
  return entries;
}

export function filterIcons(icons: IconEntry[], query: string): IconEntry[] {
  if (!query.trim()) return icons;
  const lower = query.toLowerCase();
  return icons.filter((icon) => icon.name.includes(lower));
}
