import { useState } from 'react';
import { useAllTasks, useAllProjects, useTaskMutations } from '@/hooks/useTaskData';
import TaskForm from '@/components/tasks/TaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import GoogleCalendarEvents from '@/components/GoogleCalendarEvents';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getNextDueDate } from '@/lib/taskUtils';
import { useSettings } from '@/lib/SettingsContext';
import { playCompletionSound } from '@/lib/sound';
import { format, parseISO, addDays, isToday, startOfWeek, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function Schedule() {
  const { data: tasks = [], isLoading } = useAllTasks();
  const { data: projects = [] } = useAllProjects();
  const { createTask, updateTask, deleteTask, bulkCreateTasks } = useTaskMutations();
  const { settings } = useSettings();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const isTodaySelected = isToday(parseISO(selectedDate));
  const dayTasks = tasks.filter((t) => !t.is_backlog && t.due_date === selectedDate);
  const uncompleted = dayTasks.filter((t) => !t.completed);
  const completed = dayTasks.filter((t) => t.completed);

  const weekStartsOn = settings.weekStart ?? 1;
  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const shiftWeek = (delta) => {
    const offset = differenceInDays(parseISO(selectedDate), weekStart);
    setSelectedDate(format(addDays(addDays(weekStart, delta * 7), offset), 'yyyy-MM-dd'));
  };

  const handleSave = (data) => {
    const payload = { ...data, due_date: data.due_date || selectedDate };
    if (editing) updateTask.mutate({ id: editing.id, data: payload });
    else createTask.mutate(payload);
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggle = (task) => {
    if (!isTodaySelected) return;
    const today = format(new Date(), 'yyyy-MM-dd');
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
    if (confirm('이 할 일을 삭제하시겠습니까?')) deleteTask.mutate(task.id);
  };

  const dateLabel = () => {
    try { return format(parseISO(selectedDate), 'yyyy년 M월 d일 EEEE', { locale: ko }); } catch { return selectedDate; }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">일정</h1>
          <p className="text-sm text-muted-foreground">{isTodaySelected ? '오늘' : dateLabel()} · {uncompleted.length}개</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> 추가
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={() => shiftWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{format(weekStart, 'yyyy년 M월', { locale: ko })}</span>
            {!isTodaySelected && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}>오늘</Button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => shiftWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => {
            const ds = format(d, 'yyyy-MM-dd');
            const selected = ds === selectedDate;
            const today = isToday(d);
            return (
              <button key={ds} onClick={() => setSelectedDate(ds)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-lg border text-sm transition-colors ${
                  selected ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                }`}>
                <span className="text-[10px]">{format(d, 'E', { locale: ko })}</span>
                <span className="font-medium">{format(d, 'd')}</span>
                <span className={`w-1 h-1 rounded-full ${today ? (selected ? 'bg-primary-foreground' : 'bg-primary') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {!isTodaySelected && (
        <p className="text-xs text-amber-600 mb-3">선택한 날짜는 조회·추가·삭제만 가능합니다 (완료 처리 불가).</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : dayTasks.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">이 날의 할 일이 없어요</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            {uncompleted.map((t) => (
              <TaskItem key={t.id} task={t} projects={projects}
                onToggle={handleToggle}
                onEdit={isTodaySelected ? (task) => { setEditing(task); setFormOpen(true); } : undefined}
                onDelete={handleDelete}
                canComplete={isTodaySelected}
                canEdit={isTodaySelected} />
            ))}
          </div>
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">완료됨 · {completed.length}</h2>
              <div className="space-y-2">
                {completed.map((t) => (
                  <TaskItem key={t.id} task={t} projects={projects}
                    onToggle={handleToggle}
                    onEdit={isTodaySelected ? (task) => { setEditing(task); setFormOpen(true); } : undefined}
                    onDelete={handleDelete}
                    canComplete={isTodaySelected}
                    canEdit={isTodaySelected} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GoogleCalendarEvents selectedDate={selectedDate} />

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} task={editing} projects={projects} defaultDate={selectedDate} />
    </div>
  );
}