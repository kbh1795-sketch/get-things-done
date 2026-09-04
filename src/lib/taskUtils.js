import { addDays, addWeeks, addMonths, addYears, format, parseISO, isToday, isTomorrow, isPast, isThisWeek, startOfDay } from 'date-fns';

export const PRIORITY_CONFIG = {
  1: { label: '긴급', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-500', dot: 'bg-red-500' },
  2: { label: '높음', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500', dot: 'bg-orange-500' },
  3: { label: '보통', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500', dot: 'bg-blue-500' },
  4: { label: '낮음', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-400', dot: 'bg-gray-400' },
};

export const REPEAT_LABELS = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
};

export function getNextDueDate(dueDate, frequency) {
  const base = dueDate ? parseISO(dueDate) : new Date();
  switch (frequency) {
    case 'daily': return format(addDays(base, 1), 'yyyy-MM-dd');
    case 'weekly': return format(addWeeks(base, 1), 'yyyy-MM-dd');
    case 'monthly': return format(addMonths(base, 1), 'yyyy-MM-dd');
    case 'yearly': return format(addYears(base, 1), 'yyyy-MM-dd');
    default: return null;
  }
}

export function getDateBucket(task) {
  if (task.completed) return 'completed';
  if (!task.due_date) return 'no_date';
  const d = parseISO(task.due_date);
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  if (isPast(startOfDay(d))) return 'overdue';
  if (isThisWeek(d, { weekStartsOn: 1 })) return 'this_week';
  return 'later';
}

export const BUCKET_LABELS = {
  overdue: '지연됨',
  today: '오늘',
  tomorrow: '내일',
  this_week: '이번 주',
  later: '나중에',
  no_date: '기한 없음',
  completed: '완료됨',
};

export const BUCKET_ORDER = ['overdue', 'today', 'tomorrow', 'this_week', 'later', 'no_date', 'completed'];