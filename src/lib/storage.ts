const PREFIX = 'calchub_';

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

export interface HistoryEntry {
  id: string;
  tool: string;
  toolSlug: string;
  expression: string;
  result: string;
  timestamp: number;
  favorite?: boolean;
}

export interface RecentTool {
  slug: string;
  name: string;
  timestamp: number;
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const history = getItem<HistoryEntry[]>('history', []);
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, 100);
  setItem('history', updated);
}

export function getHistory(): HistoryEntry[] {
  return getItem<HistoryEntry[]>('history', []);
}

export function toggleFavorite(id: string): void {
  const history = getHistory();
  const updated = history.map((h) =>
    h.id === id ? { ...h, favorite: !h.favorite } : h
  );
  setItem('history', updated);
}

export function clearHistory(): void {
  setItem('history', []);
}

export function trackRecentTool(slug: string, name: string): void {
  const recent = getItem<RecentTool[]>('recent', []);
  const filtered = recent.filter((r) => r.slug !== slug);
  const updated = [{ slug, name, timestamp: Date.now() }, ...filtered].slice(0, 8);
  setItem('recent', updated);
}

export function getRecentTools(): RecentTool[] {
  return getItem<RecentTool[]>('recent', []);
}

export function getToolStats(): { totalCalculations: number; favoriteCount: number; toolsUsed: number } {
  const history = getHistory();
  const recent = getRecentTools();
  return {
    totalCalculations: history.length,
    favoriteCount: history.filter((h) => h.favorite).length,
    toolsUsed: recent.length,
  };
}
