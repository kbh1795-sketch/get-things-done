import { useState } from 'react';
import { useAllTasks, useAllProjects, useTaskMutations } from '@/hooks/useTaskData';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Inbox, ArrowUpRight, Trash2, Loader2 } from 'lucide-react';
import MobileSelect from '@/components/ui/mobile-select';
import { PRIORITY_CONFIG } from '@/lib/taskUtils';
import { useI18n } from '@/lib/I18nContext';

export default function Backlog() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useAllProjects();
  const { createTask, updateTask, deleteTask } = useTaskMutations();
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(3);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const backlogTasks = tasks.filter((t) => t.is_backlog);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({ title: title.trim(), is_backlog: true, priority });
    setTitle('');
  };

  const handlePromote = (task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const handleSave = (data) => {
    updateTask.mutate({ id: editing.id, data: { ...data, is_backlog: false } });
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold">{t('backlog.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('backlog.subtitle')}</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('backlog.placeholder')} />
        <MobileSelect
          value={String(priority)}
          onValueChange={(v) => setPriority(Number(v))}
          triggerClassName="w-20 shrink-0"
          options={[1, 2, 3, 4].map((p) => ({ value: String(p), label: `P${p}` }))}
        />
        <Button type="submit" className="shrink-0"><Inbox className="w-4 h-4 mr-1" /> {t('common.add')}</Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : backlogTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('backlog.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backlogTasks.map((task) => {
            const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
            return (
              <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm">
                <span className={`w-2 h-2 rounded-full ${pri.dot} shrink-0`} />
                <span className="flex-1 text-sm font-medium">{task.title}</span>
                <span className="text-xs text-muted-foreground">P{task.priority}</span>
                <Button size="sm" variant="outline" onClick={() => handlePromote(task)}><ArrowUpRight className="w-3.5 h-3.5 mr-1" />{t('backlog.promote')}</Button>
                <button onClick={() => deleteTask.mutate(task.id)} aria-label={t('common.delete')} className="p-2.5 min-w-[44px] min-h-[44px] rounded hover:bg-muted flex items-center justify-center md:opacity-0 md:group-hover:opacity-100"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            );
          })}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} task={editing} projects={projects} />
    </div>
  );
}