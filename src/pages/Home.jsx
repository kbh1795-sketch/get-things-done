import { useState } from 'react';
import { useAllTasks, useAllProjects, useTaskMutations } from '@/hooks/useTaskData';
import TaskForm from '@/components/tasks/TaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { BUCKET_ORDER, BUCKET_LABELS, getDateBucket, getNextDueDate } from '@/lib/taskUtils';
import { format } from 'date-fns';

export default function Home() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useAllProjects();
  const { createTask, updateTask, deleteTask, bulkCreateTasks } = useTaskMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const activeTasks = tasks.filter((t) => !t.is_backlog);
  const remaining = activeTasks.filter((t) => !t.completed).length;

  const handleSave = (data) => {
    if (editing) updateTask.mutate({ id: editing.id, data });
    else createTask.mutate(data);
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggle = (task) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!task.completed && task.is_routine && task.repeat_frequency && task.repeat_frequency !== 'none') {
      updateTask.mutate({ id: task.id, data: { completed: true, completed_date: today } });
      const nextDate = getNextDueDate(task.due_date, task.repeat_frequency);
      const { id, created_date, updated_date, created_by_id, completed, completed_date, ...rest } = task;
      bulkCreateTasks.mutate([{ ...rest, completed: false, completed_date: null, due_date: nextDate }]);
    } else {
      updateTask.mutate({ id: task.id, data: { completed: !task.completed, completed_date: !task.completed ? today : null } });
    }
  };

  const handleDelete = (task) => {
    if (confirm('이 할 일을 삭제하시겠습니까?')) deleteTask.mutate(task.id);
  };

  const buckets = {};
  BUCKET_ORDER.forEach((b) => (buckets[b] = []));
  activeTasks.forEach((t) => buckets[getDateBucket(t)].push(t));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">할 일</h1>
          <p className="text-sm text-muted-foreground">{remaining}개 남았어요</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> 할 일 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : activeTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">아직 할 일이 없어요</p>
          <p className="text-sm">새 할 일을 추가해 보세요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {BUCKET_ORDER.filter((b) => buckets[b]?.length).map((b) => (
            <div key={b}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{BUCKET_LABELS[b]} · {buckets[b].length}</h2>
              <div className="space-y-2">
                {buckets[b].map((t) => (
                  <TaskItem key={t.id} task={t} projects={projects}
                    onToggle={handleToggle}
                    onEdit={(task) => { setEditing(task); setFormOpen(true); }}
                    onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} task={editing} projects={projects} />
    </div>
  );
}