import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllTasks } from '@/hooks/useTaskData';
import { useSettings } from '@/lib/SettingsContext';
import { computeDailyStreak } from '@/lib/achievements';
import { getPetMessage } from '@/lib/petMessages';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const PETS = { cat: '🐱', dog: '🐶', kangaroo: '🦘', lemur: '🐒', quokka: '🦦', koala: '🐨', hedgehog: '🦔', rabbit: '🐰', masterRabbit: '🐇' };

export default function Pet() {
  const { settings } = useSettings();
  const { data: tasks = [] } = useAllTasks();
  const [visible, setVisible] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);

  useEffect(() => {
    if (!settings.petEnabled) return;
    if (sessionStorage.getItem('pet_shown')) return;
    sessionStorage.setItem('pet_shown', '1');
    const show = setTimeout(() => setVisible(true), 600);
    const bubble = setTimeout(() => setBubbleOpen(true), 1500);
    const hide = setTimeout(() => setVisible(false), 17000);
    return () => { clearTimeout(show); clearTimeout(bubble); clearTimeout(hide); };
  }, [settings.petEnabled]);

  if (!settings.petEnabled) return null;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => t.due_date === today && !t.is_backlog);
  const remaining = todayTasks.filter((t) => !t.completed).length;
  const total = todayTasks.length;
  const { current: streak } = computeDailyStreak(tasks);
  const msg = getPetMessage(settings.language, { name: settings.petName, remaining, total, streak });

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div key="pet" className="flex flex-col items-end gap-2 pointer-events-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}>
            <AnimatePresence>
              {bubbleOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: 30, transformOrigin: 'bottom right' }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: 30 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="relative max-w-[260px] rounded-2xl rounded-br-sm border bg-card shadow-xl p-4 pr-8"
                >
                  <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" aria-label="close">
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-medium mb-1">{msg.greeting}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{msg.body}</p>
                  {msg.streak && <p className="text-xs text-orange-500 font-medium mt-1">{msg.streak}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 140, opacity: 0, scale: 0.2 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 140, opacity: 0, scale: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 13 }}
              className="cursor-pointer select-none"
              onClick={() => setBubbleOpen((v) => !v)}
              title="말풍선 열기/닫기"
            >
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl leading-none"
                style={{ filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.25))' }}
              >
                {PETS[settings.petType] || '🐱'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}