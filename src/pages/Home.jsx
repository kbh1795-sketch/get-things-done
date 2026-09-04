import { useState } from 'react';
import { useAllTasks, useAllProjects, useTaskMutations } from '@/hooks/useTaskData';
import TaskForm from '@/components/tasks/TaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { getNextDueDate } from '@/lib/taskUtils';
import { useSettings } from '@/lib/SettingsContext';
import { useI18n } from '@/lib/I18nContext';
import { playCompletionSound } from '@/lib/sound';
import Pet from '@/components/Pet';
import { format } from 'date-fns';

export default function Home() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useAllProjects();
  const { createTask, updateTask, deleteTask, bulkCreateTasks } = useTaskMutations();
  const { settings } = useSettings();
  const { t } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => !t.is_backlog && t.due_date === today);
  const uncompleted = todayTasks.filter((t) => !t.completed);
  const completed = todayTasks.filter((t) => t.completed);

  const handleSave = (data) => {
    if (editing) updateTask.mutate({ id: editing.id, data });
    else createTask.mutate(data);
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggle = (task) => {
    if (!task.completed && settings.soundEnabled) playCompletionSound();
    if (!task.completed && task.is_routine && task.repeat_frequency && task.repeat_frequency !== 'none') {
      updateTask.mutate({ id: task.id, data: { completed: true, completed_date: today } });
      const nextDate = getNextDueDate(task.due_date, task.repeat_frequency);
      const { id, created_date, updated_date, created_by_id, completed, completed_date, ...rest } = task;
      bulkCreateTasks.mutate([{ ...rest, completed: false, completed_date: null, due_date: nextDate }]);
    } else if (task.completed && task.is_routine && task.repeat_frequency && task.repeat_frequency !== 'none') {
      const nextDate = getNextDueDate(task.due_date, task.repeat_frequency);
      const spawned = nextDate ? tasks.find((t) => t.id !== task.id && t.title === task.title && !t.completed && t.due_date === nextDate && t.is_routine) : null;
      if (spawned) deleteTask.mutate(spawned.id);
      updateTask.mutate({ id: task.id, data: { completed: false, completed_date: null } });
    } else {
      updateTask.mutate({ id: task.id, data: { completed: !task.completed, completed_date: !task.completed ? today : null } });
    }
  };

  const handleDelete = (task) => {
    if (confirm(t('task.deleteConfirm'))) deleteTask.mutate(task.id);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('home.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('home.todayRemaining', { n: uncompleted.length })}</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> {t('home.addTask')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : todayTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">{t('home.empty')}</p>
          <p className="text-sm">{t('home.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            {uncompleted.map((t) => (
              <TaskItem key={t.id} task={t} projects={projects}
                onToggle={handleToggle}
                onEdit={(task) => { setEditing(task); setFormOpen(true); }}
                onDelete={handleDelete} />
            ))}
          </div>
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{t('home.completed', { n: completed.length })}</h2>
              <div className="space-y-2">
                {completed.map((t) => (
                  <TaskItem key={t.id} task={t} projects={projects}
                    onToggle={handleToggle}
                    onEdit={(task) => { setEditing(task); setFormOpen(true); }}
                    onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} task={editing} projects={projects} defaultDate={today} />
      <Pet />
    </div>
  );
}