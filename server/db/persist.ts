/**
 * Keeps dashboard edits across server restarts: the whole in-memory DB is written to data/db.json
 * after every write request and loaded back on startup.
 * ponytail: one JSON snapshot per write; move to real DB tables when the database plan is implemented.
 */
import fs from 'fs';
import path from 'path';
import { db } from './store';
import { collections } from './collections';

const FILE = path.join(process.cwd(), 'data', 'db.json');
// Audio buffers are too large for JSON; integration secrets must never be written to disk in plain text
const SKIP = new Set(['audioFiles', 'integrations']);

export const loadDb = () => {
  if (!fs.existsSync(FILE)) return;
  try {
    const saved = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    for (const [key, value] of Object.entries(saved.store || {})) {
      if (SKIP.has(key) || !(key in db)) continue;
      const current = (db as any)[key];
      (db as any)[key] = current instanceof Map ? new Map(value as [string, any][]) : value;
    }
    collections.restore(saved.collections || {}, saved.deleted || {});
    console.log(`[db] loaded saved data from ${FILE}`);
  } catch (err) {
    console.error('[db] could not read saved data, starting from seed:', err);
  }
};

const write = () => {
  const store: Record<string, any> = {};
  for (const [key, value] of Object.entries(db)) {
    if (!SKIP.has(key)) store[key] = value instanceof Map ? [...value] : value;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(`${FILE}.tmp`, JSON.stringify({ store, ...collections.snapshot() }));
  fs.renameSync(`${FILE}.tmp`, FILE); // atomic swap: a crash mid-write never leaves a half file
};

let timer: NodeJS.Timeout | undefined;
export const saveDb = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try { write(); } catch (err) { console.error('[db] save failed:', err); }
  }, 300);
};
