import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAllTasks, useAllProjects, useProjectMutations, useTaskMutations } from '@/hooks/useTaskData';
import ProjectForm from '@/components/projects/ProjectForm';
import TaskItem from '@/components/tasks/TaskItem';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Pencil, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { format } from 'date-fns';

export default function Projects() {
  const { data: projects = [], isLoading } = useAllProjects();
  const { data: tasks = [] } = useAllTasks();
  const { createProject, updateProject, deleteProject } = useProjectMutations();
  const { updateTask, deleteTask } = useTaskMutations();
  const { t } = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const selected = id ? projects.find((p) => p.id === id) : null;

  const handleSave = (data) => {
    if (editing) updateProject.mutate({ id: editing.id, data });
    else createProject.mutate(data);
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (project) => {
    if (confirm(t('projects.deleteConfirm', { name: project.name }))) deleteProject.mutate(project.id);
  };

  const handleToggle = (task) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    updateTask.mutate({ id: task.id, data: { completed: !task.completed, completed_date: !task.completed ? today : null } });
  };

  if (id) {
    if (!selected) {
      if (isLoading) {
        return (
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          </div>
        );
      }
      return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button onClick={() => navigate('/projects')} className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> {t('projects.back')}
          </button>
          <p className="text-center text-muted-foreground py-10">{t('projects.notFound')}</p>
        </div>
      );
    }
    const projectTasks = tasks.filter((t) => t.project_id === selected.id);
    const done = projectTasks.filter((t) => t.completed).length;
    const progress = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate('/projects')} className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {t('projects.back')}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
          <h1 className="text-2xl font-heading font-bold">{selected.name}</h1>
        </div>
        {selected.description && <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{t('projects.completed', { done, total: projectTasks.length })}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: selected.color }} />
          </div>
        </div>
        <div className="space-y-2">
          {projectTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">{t('projects.noTasks')}</p>
          ) : projectTasks.map((t) => (
            <TaskItem key={t.id} task={t} projects={projects} onToggle={handleToggle}
              onDelete={(task) => deleteTask.mutate(task.id)} onEdit={() => {}} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('projects.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="w-4 h-4 mr-1" /> {t('projects.add')}</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('projects.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.project_id === p.id);
            const done = pTasks.filter((t) => t.completed).length;
            const progress = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            return (
              <div key={p.id} className="rounded-xl border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <h3 className="font-semibold">{p.name}</h3>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditing(p); setFormOpen(true); }} aria-label={t('common.edit')} className="p-2.5 min-w-[44px] min-h-[44px] rounded hover:bg-muted flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => handleDelete(p)} aria-label={t('common.delete')} className="p-2.5 min-w-[44px] min-h-[44px] rounded hover:bg-muted flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
                {p.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{done} / {pTasks.length}</span><span>{progress}%</span></div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }} /></div>
              </div>
            );
          })}
        </div>
      )}
      <ProjectForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} project={editing} />
    </div>
  );
}