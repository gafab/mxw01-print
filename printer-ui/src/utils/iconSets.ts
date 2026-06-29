import type { IconEntry, IconSize } from '../types';

export interface IconSet {
  id: string;
  name: string;
  icons: IconEntry[];
  size: IconSize;
  columns: number;
  spacing: number;
}

const STORAGE_KEY = 'mxw01-icon-sets';

export function loadIconSets(): IconSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveIconSets(sets: IconSet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export function addIconSet(set: Omit<IconSet, 'id'>): IconSet[] {
  const sets = loadIconSets();
  const newSet: IconSet = { ...set, id: crypto.randomUUID() };
  sets.push(newSet);
  saveIconSets(sets);
  return sets;
}

export function deleteIconSet(id: string): IconSet[] {
  const sets = loadIconSets().filter((s) => s.id !== id);
  saveIconSets(sets);
  return sets;
}

export function updateIconSet(id: string, update: Partial<Omit<IconSet, 'id'>>): IconSet[] {
  const sets = loadIconSets().map((s) => (s.id === id ? { ...s, ...update } : s));
  saveIconSets(sets);
  return sets;
}
