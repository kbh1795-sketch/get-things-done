import { useState } from 'react';
import { useAllTasks } from '@/hooks/useTaskData';
import { useSettings } from '@/lib/SettingsContext';
import { useI18n } from '@/lib/I18nContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import {
  format, parseISO, startOfWeek, endOfWeek, startOfMonth, startOfYear,
  eachDayOfInterval, subDays, subWeeks, subMonths, subYears,
  addMonths, addYears, isSameDay,
} from 'date-fns';

const VIEW_KEYS = [
  { key: 'daily', tkey: 'stats.daily' },
  { key: 'weekly', tkey: 'stats.weekly' },
  { key: 'monthly', tkey: 'stats.monthly' },
  { key: 'yearly', tkey: 'stats.yearly' },
];

export default function Stats() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { settings } = useSettings();
  const { t, dateLocale } = useI18n();
  const [view, setView] = useState('daily');

  const completed = tasks.filter((t) => t.completed && t.completed_date);
  const now = new Date();

  const buildData = () => {
    if (view === 'daily') {
      const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
      return days.map((d) => ({
        label: format(d, 'E', { locale: dateLocale }),
        count: completed.filter((t) => t.completed_date && isSameDay(parseISO(t.completed_date), d)).length,
      }));
    }
    if (view === 'weekly') {
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const start = startOfWeek(subWeeks(now, i), { weekStartsOn: settings.weekStart });
        const end = endOfWeek(subWeeks(now, i), { weekStartsOn: settings.weekStart });
        weeks.push({ start, end });
      }
      return weeks.map((w) => ({
        label: format(w.start, 'M/d'),
        count: completed.filter((t) => {
          if (!t.completed_date) return false;
          const d = parseISO(t.completed_date);
          return d >= w.start && d <= w.end;
        }).length,
      }));
    }
    if (view === 'monthly') {
      const months = [];
      for (let i = 11; i >= 0; i--) months.push(startOfMonth(subMonths(now, i)));
      return months.map((m) => ({
        label: format(m, 'MMM', { locale: dateLocale }),
        count: completed.filter((t) => {
          if (!t.completed_date) return false;
          const d = parseISO(t.completed_date);
          return d >= m && d < addMonths(m, 1);
        }).length,
      }));
    }
    const years = [];
    for (let i = 4; i >= 0; i--) years.push(startOfYear(subYears(now, i)));
    return years.map((y) => ({
      label: format(y, 'yyyy'),
      count: completed.filter((t) => {
        if (!t.completed_date) return false;
        const d = parseISO(t.completed_date);
        return d >= y && d < addYears(y, 1);
      }).length,
    }));
  };

  const chartData = buildData();
  const todayCount = completed.filter((t) => t.completed_date && isSameDay(parseISO(t.completed_date), now)).length;
  const thisWeekCount = completed.filter((t) => {
    if (!t.completed_date) return false;
    return parseISO(t.completed_date) >= startOfWeek(now, { weekStartsOn: settings.weekStart });
  }).length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-heading font-bold mb-6">{t('stats.title')}</h1>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard icon={CheckCircle2} label={t('stats.todayDone')} value={todayCount} color="text-green-600" bg="bg-green-50" />
            <StatCard icon={Target} label={t('stats.thisWeek')} value={thisWeekCount} color="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={TrendingUp} label={t('stats.totalDone')} value={completed.length} color="text-purple-600" bg="bg-purple-50" />
          </div>
          <div className="rounded-xl border bg-card p-4 md:p-6">
            <div className="flex gap-2 mb-4">
              {VIEW_KEYS.map((v) => (
                <button key={v.key} onClick={() => setView(v.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === v.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                  {t(v.tkey)}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name={t('stats.barName')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-1`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}