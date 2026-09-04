import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/I18nContext';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'];
const EMPTY = { name: '', description: '', color: '#6366f1' };

export default function ProjectForm({ open, onClose, onSave, project }) {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (project) setForm({ name: project.name || '', description: project.description || '', color: project.color || '#6366f1' });
      else setForm(EMPTY);
    }
  }, [project, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? t('projectform.titleEdit') : t('projectform.titleNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pname">{t('projectform.nameLabel')}</Label>
            <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdesc">{t('projectform.descLabel')}</Label>
            <textarea id="pdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-2">
            <Label>{t('projectform.colorLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit">{project ? t('projectform.saveEdit') : t('projectform.saveNew')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}