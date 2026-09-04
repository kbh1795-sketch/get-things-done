import { useState, useEffect } from 'react';
import { useAllTasks } from '@/hooks/useTaskData';
import { useSettings } from '@/lib/SettingsContext';
import { computeDailyStreak } from '@/lib/achievements';
import { getPetMessage } from '@/lib/petMessages';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const PETS = { cat: '🐱', dog: '🐶', kangaroo: '🦘', lemur: '🦝', quokka: '🦦', koala: '🐨', hedgehog: '🦔', rabbit: '🐰', masterRabbit: '🐇' };

export default function Pet() {
  const { settings } = useSettings();
  const { data: tasks = [] } = useAllTasks();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!settings.petEnabled) return;
    if (sessionStorage.getItem('pet_shown')) return;
    sessionStorage.setItem('pet_shown', '1');
    const show = setTimeout(() => setVisible(true), 700);
    const hide = setTimeout(() => setVisible(false), 16000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [settings.petEnabled]);

  if (!settings.petEnabled || !visible) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => t.due_date === today && !t.is_backlog);
  const remaining = todayTasks.filter((t) => !t.completed).length;
  const total = todayTasks.length;
  const { current: streak } = computeDailyStreak(tasks);
  const msg = getPetMessage(settings.language, { name: settings.petName, remaining, total, streak });

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 max-w-[280px] animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-2xl border bg-card shadow-xl p-4 pr-8">
        <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" aria-label="close">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="text-4xl select-none">{PETS[settings.petType] || '🐱'}</div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium mb-1">{msg.greeting}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{msg.body}</p>
            {msg.streak && <p className="text-xs text-orange-500 font-medium mt-1">{msg.streak}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}