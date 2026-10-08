import { useState } from 'react';
import { useAllTasks, useAllProjects, useProjectMutations, useTaskMutations } from '@/hooks/useTaskData';
import TaskItem from '@/components/tasks/TaskItem';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Zap, X, Loader2, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { format } from 'date-fns';

export default function Sprint() {
  const { data: projects = [], isLoading } = useAllProjects();
  const { data: tasks = [] } = useAllTasks();
  const { updateProject } = useProjectMutations();
  const { updateTask, deleteTask } = useTaskMutations();
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [open, setOpen] = useState({});
  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const sprintProjects = projects.filter((p) => p.in_sprint);
  const availableProjects = projects.filter((p) => !p.in_sprint);

  const handleToggleTask = (task) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    updateTask.mutate({ id: task.id, data: { completed: !task.completed, completed_date: !task.completed ? today : null } });
  };

  const handleDelete = (task) => {
    if (confirm(t('task.deleteConfirm'))) deleteTask.mutate(task.id);
  };

  const addToSprint = (projectId) => {
    updateProject.mutate({ id: projectId, data: { in_sprint: true } });
    setPickerOpen(false);
  };

  const removeFromSprint = (projectId) => {
    updateProject.mutate({ id: projectId, data: { in_sprint: false } });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-primary" /> {t('sprint.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('sprint.subtitle')}</p>
        </div>
        {availableProjects.length > 0 && (
          <DropdownMenu open={pickerOpen} onOpenChange={setPickerOpen}>
            <DropdownMenuTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> {t('sprint.addProject')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableProjects.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => addToSprint(p.id)}>
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : sprintProjects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg mb-2">{t('sprint.empty')}</p>
          <p className="text-sm">{t('sprint.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sprintProjects.map((p) => {
            const pTasks = tasks.filter((tk) => tk.project_id === p.id);
            const done = pTasks.filter((tk) => tk.completed).length;
            const progress = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            const uncompleted = pTasks.filter((tk) => !tk.completed);
            const completed = pTasks.filter((tk) => tk.completed);
            return (
              <div key={p.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => toggle(p.id)}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <h3 className="font-semibold">{p.name}</h3>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open[p.id] ? 'rotate-180' : ''}`} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromSprint(p.id); }} aria-label={t('sprint.remove')} className="p-2.5 min-w-[44px] min-h-[44px] rounded hover:bg-muted flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                {p.description && <p className="text-xs text-muted-foreground mb-3">{p.description}</p>}
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{done} / {pTasks.length}</span><span>{progress}%</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-4"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} /></div>
                {open[p.id] && (
                <div className="space-y-2">
                  {pTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 text-sm">{t('sprint.noTasks')}</p>
                  ) : (
                    <>
                      {uncompleted.map((tk) => (
                        <TaskItem key={tk.id} task={tk} projects={projects} onToggle={handleToggleTask} onDelete={handleDelete} />
                      ))}
                      {completed.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 px-1">{t('home.completed', { n: completed.length })}</p>
                          <div className="space-y-2">
                            {completed.map((tk) => (
                              <TaskItem key={tk.id} task={tk} projects={projects} onToggle={handleToggleTask} onDelete={handleDelete} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}