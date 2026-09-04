import { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export default function TaskCountdown({ dueDate, dueTime }) {
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
  if (days > 0) label = `${days}일 ${hours}시간`;
  else if (hours > 0) label = `${hours}시간 ${mins}분`;
  else label = `${mins}분 ${secs}초`;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'}`}>
      {overdue ? <AlertTriangle className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
      {overdue ? `지연 ${label}` : `D-${label}`}
    </span>
  );
}