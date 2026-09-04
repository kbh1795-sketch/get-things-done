import { format, subDays, subWeeks, subMonths, parseISO, differenceInDays, startOfWeek, startOfMonth } from 'date-fns';

export function getDailyCounts(tasks) {
  const counts = {};
  tasks.filter((t) => t.completed && t.completed_date).forEach((t) => {
    counts[t.completed_date] = (counts[t.completed_date] || 0) + 1;
  });
  return counts;
}

export function computeDailyStreak(tasks, goal = 1) {
  const counts = getDailyCounts(tasks);
  const met = (d) => (counts[format(d, 'yyyy-MM-dd')] || 0) >= goal;
  let current = 0;
  let cursor = new Date();
  if (!met(cursor)) cursor = subDays(cursor, 1);
  while (met(cursor)) { current++; cursor = subDays(cursor, 1); }

  const sorted = Object.keys(counts).sort();
  let best = 0, run = 0, prev = null;
  for (const d of sorted) {
    if ((counts[d] || 0) < goal) { run = 0; prev = d; continue; }
    if (prev && differenceInDays(parseISO(d), parseISO(prev)) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best };
}

export function computeWeeklyStreak(tasks, weekStartsOn = 1) {
  const counts = {};
  tasks.filter((t) => t.completed && t.completed_date).forEach((t) => {
    const wk = format(startOfWeek(parseISO(t.completed_date), { weekStartsOn }), 'yyyy-MM-dd');
    counts[wk] = (counts[wk] || 0) + 1;
  });
  let current = 0;
  let cursor = startOfWeek(new Date(), { weekStartsOn });
  if (!counts[format(cursor, 'yyyy-MM-dd')]) cursor = subWeeks(cursor, 1);
  while (counts[format(cursor, 'yyyy-MM-dd')]) { current++; cursor = subWeeks(cursor, 1); }
  return current;
}

export function computeMonthlyStreak(tasks) {
  const counts = {};
  tasks.filter((t) => t.completed && t.completed_date).forEach((t) => {
    const m = format(startOfMonth(parseISO(t.completed_date)), 'yyyy-MM-dd');
    counts[m] = (counts[m] || 0) + 1;
  });
  let current = 0;
  let cursor = startOfMonth(new Date());
  if (!counts[format(cursor, 'yyyy-MM-dd')]) cursor = subMonths(cursor, 1);
  while (counts[format(cursor, 'yyyy-MM-dd')]) { current++; cursor = subMonths(cursor, 1); }
  return current;
}

export const MILESTONES = [
  { id: 'first', label: '첫 완료', threshold: 1, type: 'total', emoji: '🌱' },
  { id: 'm10', label: '10개 완료', threshold: 10, type: 'total', emoji: '⭐' },
  { id: 'm50', label: '50개 완료', threshold: 50, type: 'total', emoji: '🏆' },
  { id: 'm100', label: '100개 완료', threshold: 100, type: 'total', emoji: '💯' },
  { id: 'm250', label: '250개 완료', threshold: 250, type: 'total', emoji: '🚀' },
  { id: 'm500', label: '500개 완료', threshold: 500, type: 'total', emoji: '👑' },
  { id: 's7', label: '7일 연속', threshold: 7, type: 'streak', emoji: '🔥' },
  { id: 's30', label: '30일 연속', threshold: 30, type: 'streak', emoji: '⚡' },
];