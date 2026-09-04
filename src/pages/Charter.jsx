import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Eye, Pencil, Check } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import Markdown from '@/components/Markdown';

export default function Charter() {
  const { t } = useI18n();
  const [record, setRecord] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('edit');

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Charter.list();
        if (list.length > 0) {
          setRecord(list[0]);
          setContent(list[0].content || '');
        }
      } catch (e) { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record) {
        const updated = await base44.entities.Charter.update(record.id, { content });
        setRecord(updated);
      } else {
        const created = await base44.entities.Charter.create({ content });
        setRecord(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t('charter.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('charter.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setMode('edit')} className={`px-3 py-1.5 ${mode === 'edit' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`} aria-label="edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setMode('preview')} className={`px-3 py-1.5 ${mode === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`} aria-label="preview">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {saved ? t('charter.saved') : t('common.save')}
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('charter.placeholder')}
          className="w-full min-h-[65vh] rounded-xl border bg-card p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <div className="w-full min-h-[65vh] rounded-xl border bg-card p-6">
          {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-muted-foreground text-sm">{t('charter.empty')}</p>}
        </div>
      )}
    </div>
  );
}