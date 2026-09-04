import { Repeat2, Clock, MoreVertical, Pencil, Trash2, Folder } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PRIORITY_CONFIG, REPEAT_LABELS, formatTime } from '@/lib/taskUtils';
import { useSettings } from '@/lib/SettingsContext';
import TaskCountdown from './TaskCountdown';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function TaskItem({ task, projects, onToggle, onEdit, onDelete }) {
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const project = projects?.find((p) => p.id === task.project_id);
  const { settings } = useSettings();

  const dateLabel = () => {
    if (!task.due_date) return null;
    try { return format(parseISO(task.due_date), settings.dateFormat, { locale: ko }); } catch { return task.due_date; }
  };

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow ${task.completed ? 'opacity-60' : ''}`}>
      <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task)} className="mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${pri.dot} shrink-0`} title={`P${task.priority} ${pri.label}`} />
          <span className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
          {task.is_routine && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
              <Repeat2 className="w-3 h-3" /> {REPEAT_LABELS[task.repeat_frequency]}
            </span>
          )}
          {project && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ color: project.color, backgroundColor: project.color + '15' }}>
              <Folder className="w-3 h-3" /> {project.name}
            </span>
          )}
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />{dateLabel()}{task.due_time ? ` ${formatTime(task.due_time, settings.timeFormat)}` : ''}
          </div>
        )}
        {task.priority === 1 && !task.completed && task.due_date && (
          <div className="mt-1"><TaskCountdown dueDate={task.due_date} dueTime={task.due_time} /></div>
        )}
        {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}><Pencil className="w-4 h-4 mr-2" />수정</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}