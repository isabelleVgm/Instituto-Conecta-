// Ofensiva (dias seguidos de estudo) e XP total.
// Regra: ao concluir uma lição, se a última conclusão foi ontem → ofensiva + 1;
// se foi hoje → mantém; se foi antes de ontem (ou nunca) → recomeça em 1.

import { readJSON, writeJSON } from './storage.js';

const STORAGE_KEY = 'progresso';
const DAY_MS = 24 * 60 * 60 * 1000;

// Data local no formato AAAA-MM-DD (evita o fuso UTC do toISOString)
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Diferença em dias de calendário entre duas chaves AAAA-MM-DD
function daysBetween(fromKey, toKey) {
  const [y1, m1, d1] = fromKey.split('-').map(Number);
  const [y2, m2, d2] = toKey.split('-').map(Number);
  const from = Date.UTC(y1, m1 - 1, d1);
  const to = Date.UTC(y2, m2 - 1, d2);
  return Math.round((to - from) / DAY_MS);
}

function isValidKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function readProgress() {
  const data = readJSON(STORAGE_KEY, null);
  if (!data || typeof data !== 'object') {
    return { lastDate: null, streak: 0, xp: 0 };
  }
  return {
    lastDate: isValidKey(data.lastDate) ? data.lastDate : null,
    streak: Number.isFinite(data.streak) && data.streak > 0 ? Math.floor(data.streak) : 0,
    xp: Number.isFinite(data.xp) && data.xp > 0 ? Math.floor(data.xp) : 0,
  };
}

// Ofensiva "viva" hoje: vale se a última lição foi hoje ou ontem.
export function getProgress(today = new Date()) {
  const progress = readProgress();
  let currentStreak = 0;
  if (progress.lastDate) {
    const gap = daysBetween(progress.lastDate, toDateKey(today));
    if (gap === 0 || gap === 1) currentStreak = progress.streak;
  }
  return {
    streak: currentStreak,
    xp: progress.xp,
    doneToday: progress.lastDate === toDateKey(today),
  };
}

// Registra a conclusão de uma lição e devolve o novo estado.
export function registerCompletion(xpGained = 0, today = new Date()) {
  const progress = readProgress();
  const todayKey = toDateKey(today);
  let streak = 1;

  if (progress.lastDate) {
    const gap = daysBetween(progress.lastDate, todayKey);
    if (gap === 0) streak = Math.max(progress.streak, 1);
    else if (gap === 1) streak = progress.streak + 1;
  }

  const next = { lastDate: todayKey, streak, xp: progress.xp + xpGained };
  const saved = writeJSON(STORAGE_KEY, next);
  return { streak: next.streak, xp: next.xp, saved };
}

export function formatDays(count) {
  return `${count} ${count === 1 ? 'dia' : 'dias'}`;
}
