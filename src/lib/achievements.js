import { format, subDays, subWeeks, subMonths, parseISO, differenceInDays, startOfWeek, startOfMonth, eachDayOfInterval, endOfWeek, endOfMonth } from 'date-fns';

// A day is "achieved" when ALL three conditions are met:
// 1. at least 3 tasks completed that day
// 2. 80%+ of routine tasks due that day are completed
// 3. 100% of priority-1 tasks due that day are completed
export function isDayAchieved(tasks, dateStr) {
  const completedThatDay = tasks.filter((t) => t.completed && t.completed_date === dateStr).length;
  if (completedThatDay < 3) return false;

  const routineDue = tasks.filter((t) => t.due_date === dateStr && t.is_routine);
  if (routineDue.length > 0) {
    const done = routineDue.filter((t) => t.completed).length;
    if (done / routineDue.length < 0.8) return false;
  }

  const p1Due = tasks.filter((t) => t.due_date === dateStr && t.priority === 1);
  if (p1Due.length > 0) {
    const done = p1Due.filter((t) => t.completed).length;
    if (done < p1Due.length) return false;
  }
  return true;
}

export function getDayProgress(tasks, dateStr) {
  const completedThatDay = tasks.filter((t) => t.completed && t.completed_date === dateStr).length;
  const routineDue = tasks.filter((t) => t.due_date === dateStr && t.is_routine);
  const p1Due = tasks.filter((t) => t.due_date === dateStr && t.priority === 1);
  return {
    completedCount: completedThatDay,
    routineDone: routineDue.filter((t) => t.completed).length,
    routineTotal: routineDue.length,
    p1Done: p1Due.filter((t) => t.completed).length,
    p1Total: p1Due.length,
    achieved: isDayAchieved(tasks, dateStr),
  };
}

export function computeDailyStreak(tasks) {
  const dateSet = new Set();
  tasks.forEach((t) => {
    if (t.completed_date) dateSet.add(t.completed_date);
    if (t.due_date) dateSet.add(t.due_date);
  });
  const dates = [...dateSet].sort();

  let current = 0;
  let cursor = new Date();
  if (!isDayAchieved(tasks, format(cursor, 'yyyy-MM-dd'))) cursor = subDays(cursor, 1);
  while (isDayAchieved(tasks, format(cursor, 'yyyy-MM-dd'))) { current++; cursor = subDays(cursor, 1); }

  let best = 0, run = 0, prev = null;
  for (const d of dates) {
    if (!isDayAchieved(tasks, d)) { run = 0; prev = d; continue; }
    if (prev && differenceInDays(parseISO(d), parseISO(prev)) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best };
}

function weekHasPerfectDay(tasks, weekStart, weekStartsOn) {
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn }) });
  return days.some((d) => isDayAchieved(tasks, format(d, 'yyyy-MM-dd')));
}

export function computeWeeklyStreak(tasks, weekStartsOn = 1) {
  let current = 0;
  let cursor = startOfWeek(new Date(), { weekStartsOn });
  if (!weekHasPerfectDay(tasks, cursor, weekStartsOn)) cursor = subWeeks(cursor, 1);
  while (weekHasPerfectDay(tasks, cursor, weekStartsOn)) { current++; cursor = subWeeks(cursor, 1); }
  return current;
}

function monthHasPerfectDay(tasks, monthStart) {
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) });
  return days.some((d) => isDayAchieved(tasks, format(d, 'yyyy-MM-dd')));
}

export function computeMonthlyStreak(tasks) {
  let current = 0;
  let cursor = startOfMonth(new Date());
  if (!monthHasPerfectDay(tasks, cursor)) cursor = subMonths(cursor, 1);
  while (monthHasPerfectDay(tasks, cursor)) { current++; cursor = subMonths(cursor, 1); }
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