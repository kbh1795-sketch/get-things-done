import { Repeat2, Clock, MoreVertical, Pencil, Trash2, Folder, CalendarClock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PRIORITY_CONFIG, formatTime } from '@/lib/taskUtils';
import { useSettings } from '@/lib/SettingsContext';
import { useI18n } from '@/lib/I18nContext';
import TaskCountdown from './TaskCountdown';
import { format, parseISO } from 'date-fns';

export default function TaskItem({ task, projects, onToggle, onEdit, onDelay, onDelete, canComplete = true, canEdit = true }) {
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[3];
  const project = projects?.find((p) => p.id === task.project_id);
  const { settings } = useSettings();
  const { t, dateLocale } = useI18n();

  const dateLabel = () => {
    if (!task.due_date) return null;
    try { return format(parseISO(task.due_date), settings.dateFormat, { locale: dateLocale }); } catch { return task.due_date; }
  };

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow ${task.completed ? 'opacity-60' : ''}`}>
      <Checkbox checked={task.completed} onCheckedChange={() => canComplete && onToggle?.(task)} disabled={!canComplete} className="mt-1" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${pri.dot} shrink-0`} title={`P${task.priority} ${t('priority.' + task.priority)}`} />
          <span className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
          {task.is_routine && (
            <span className="inline-flex items-center gap-0.5 text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
              <Repeat2 className="w-3 h-3" /> {t('repeat.' + task.repeat_frequency)}
            </span>
          )}
          {project && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
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
      <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 min-w-[44px] min-h-[44px] rounded hover:bg-muted flex items-center justify-center" aria-label={t('common.edit')}><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && onEdit && <DropdownMenuItem onClick={() => onEdit(task)}><Pencil className="w-4 h-4 mr-2" />{t('common.edit')}</DropdownMenuItem>}
            {onDelay && <DropdownMenuItem onClick={() => onDelay(task)}><CalendarClock className="w-4 h-4 mr-2" />{t('task.delayToToday')}</DropdownMenuItem>}
            <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />{t('common.delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}