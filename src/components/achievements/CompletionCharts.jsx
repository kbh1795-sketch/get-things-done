import { useState } from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { useI18n } from '@/lib/I18nContext';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { eachDayOfInterval, startOfWeek, endOfWeek, subDays, subWeeks, parseISO, format, isSameDay } from 'date-fns';

const TABS = [
  { key: 'daily', tkey: 'achievements.chartsDaily' },
  { key: 'weekly', tkey: 'achievements.chartsWeekly' },
  { key: 'cumulative', tkey: 'achievements.chartsCumulative' },
];

export default function CompletionCharts({ tasks }) {
  const { settings } = useSettings();
  const { t, dateLocale } = useI18n();
  const [view, setView] = useState('daily');
  const primaryChannels = window.getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const chartFill = primaryChannels ? `hsl(${primaryChannels})` : '#6366f1';

  const completed = tasks.filter((tk) => tk.completed && tk.completed_date);
  const now = new Date();

  const dailyData = () => {
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
    return days.map((d) => ({
      label: format(d, 'M/d', { locale: dateLocale }),
      count: completed.filter((tk) => tk.completed_date && isSameDay(parseISO(tk.completed_date), d)).length,
    }));
  };

  const weeklyData = () => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = startOfWeek(subWeeks(now, i), { weekStartsOn: settings.weekStart });
      const end = endOfWeek(subWeeks(now, i), { weekStartsOn: settings.weekStart });
      weeks.push({ start, end });
    }
    return weeks.map((w) => ({
      label: format(w.start, 'M/d'),
      count: completed.filter((tk) => {
        if (!tk.completed_date) return false;
        const d = parseISO(tk.completed_date);
        return d >= w.start && d <= w.end;
      }).length,
    }));
  };

  const cumulativeData = () => {
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now });
    let running = 0;
    return days.map((d) => {
      running += completed.filter((tk) => tk.completed_date && isSameDay(parseISO(tk.completed_date), d)).length;
      return { label: format(d, 'M/d', { locale: dateLocale }), count: running };
    });
  };

  const data = view === 'daily' ? dailyData() : view === 'weekly' ? weeklyData() : cumulativeData();

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm font-medium mb-3">{t('achievements.chartsTitle')}</p>
      <div className="flex gap-2 mb-4">
        {TABS.map((tb) => (
          <button key={tb.key} onClick={() => setView(tb.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === tb.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
            {t(tb.tkey)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        {view === 'cumulative' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartFill} stopOpacity={0.4} />
                <stop offset="95%" stopColor={chartFill} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="count" stroke={chartFill} fill="url(#cumFill)" strokeWidth={2} name={t('achievements.chartsCount')} />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill={chartFill} radius={[6, 6, 0, 0]} name={t('achievements.chartsCount')} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}