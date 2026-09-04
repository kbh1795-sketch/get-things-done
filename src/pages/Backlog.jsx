import { useState } from 'react';
import { useAllTasks, useAllProjects, useTaskMutations } from '@/hooks/useTaskData';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Inbox, ArrowUpRight, Trash2, Loader2 } from 'lucide-react';
import { PRIORITY_CONFIG } from '@/lib/taskUtils';

export default function Backlog() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useAllProjects();
  const { createTask, updateTask, deleteTask } = useTaskMutations();
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
        <h1 className="text-2xl font-heading font-bold">백로그</h1>
        <p className="text-sm text-muted-foreground">장기적으로 추진할 사항을 기록해 두고, 필요할 때 GTD로 끌어올리세요</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="백로그에 추가할 항목..." />
        <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}
          className="rounded-md border border-input bg-transparent px-2 text-sm shrink-0">
          {[1, 2, 3, 4].map((p) => <option key={p} value={p}>P{p}</option>)}
        </select>
        <Button type="submit" className="shrink-0"><Inbox className="w-4 h-4 mr-1" /> 추가</Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : backlogTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>백로그가 비어있어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {backlogTasks.map((t) => {
            const pri = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG[3];
            return (
              <div key={t.id} className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm">
                <span className={`w-2 h-2 rounded-full ${pri.dot} shrink-0`} />
                <span className="flex-1 text-sm font-medium">{t.title}</span>
                <span className="text-[10px] text-muted-foreground">P{t.priority}</span>
                <Button size="sm" variant="outline" onClick={() => handlePromote(t)}><ArrowUpRight className="w-3.5 h-3.5 mr-1" />GTD로</Button>
                <button onClick={() => deleteTask.mutate(t.id)} className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            );
          })}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} task={editing} projects={projects} />
    </div>
  );
}