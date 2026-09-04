import { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';

export default function TaskCountdown({ dueDate, dueTime }) {
  const { t } = useI18n();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!dueDate) return null;
  const target = dueTime ? new Date(`${dueDate}T${dueTime}:00`) : new Date(`${dueDate}T23:59:00`);
  const diff = target - now;
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);

  let label;
  if (days > 0) label = t('countdown.dayHour', { d: days, h: hours });
  else if (hours > 0) label = t('countdown.hourMin', { h: hours, m: mins });
  else label = t('countdown.minSec', { m: mins, s: secs });

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'}`}>
      {overdue ? <AlertTriangle className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
      {overdue ? `${t('countdown.overdue')} ${label}` : `${t('countdown.due')}${label}`}
    </span>
  );
}