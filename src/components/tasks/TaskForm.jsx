import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRIORITY_CONFIG } from '@/lib/taskUtils';

const PRIORITIES = [1, 2, 3, 4].map((v) => ({ value: v, ...PRIORITY_CONFIG[v] }));
const REPEAT_OPTIONS = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

const EMPTY = { title: '', description: '', due_date: '', due_time: '', priority: 3, is_routine: false, repeat_frequency: 'daily', project_id: '' };

export default function TaskForm({ open, onClose, onSave, task, projects, defaultDate }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title || '',
          description: task.description || '',
          due_date: task.due_date || '',
          due_time: task.due_time || '',
          priority: task.priority || 3,
          is_routine: task.is_routine || false,
          repeat_frequency: task.repeat_frequency && task.repeat_frequency !== 'none' ? task.repeat_frequency : 'daily',
          project_id: task.project_id || '',
        });
      } else {
        setForm({ ...EMPTY, due_date: defaultDate || '' });
      }
    }
  }, [task, open, defaultDate]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      priority: Number(form.priority),
      project_id: form.project_id || null,
      repeat_frequency: form.is_routine ? form.repeat_frequency : 'none',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? '할 일 수정' : '새 할 일'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="할 일을 입력하세요" autoFocus required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">날짜</Label>
              <Input id="due_date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_time">시간</Label>
              <Input id="due_time" type="time" value={form.due_time} onChange={(e) => setForm({ ...form, due_time: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>중요도</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button key={p.value} type="button" onClick={() => setForm({ ...form, priority: p.value })}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-colors ${
                    form.priority === p.value ? `${p.bg} ${p.border} ${p.color}` : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  <span className={`w-3 h-3 rounded-full ${p.dot}`} />
                  <span className="text-xs font-medium">P{p.value}</span>
                  <span className="text-[10px]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>프로젝트 (선택)</Label>
            <Select value={form.project_id || 'none'} onValueChange={(v) => setForm({ ...form, project_id: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="프로젝트 없음" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">프로젝트 없음</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="is_routine" className="cursor-pointer">반복 할 일</Label>
              <p className="text-xs text-muted-foreground">정기적으로 반복되는 작업</p>
            </div>
            <Switch id="is_routine" checked={form.is_routine} onCheckedChange={(c) => setForm({ ...form, is_routine: c })} />
          </div>
          {form.is_routine && (
            <div className="space-y-2">
              <Label>반복 주기</Label>
              <div className="grid grid-cols-4 gap-2">
                {REPEAT_OPTIONS.map((r) => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, repeat_frequency: r.value })}
                    className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.repeat_frequency === r.value ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit">{task ? '수정' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}