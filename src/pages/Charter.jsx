import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Check } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import Markdown from '@/components/Markdown';

export default function Charter() {
  const { t } = useI18n();
  const [record, setRecord] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <Button onClick={handleSave} disabled={saving}>
          {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {saved ? t('charter.saved') : t('common.save')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 px-1">{t('charter.edit')}</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('charter.placeholder')}
            className="w-full min-h-[65vh] rounded-xl border bg-card p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 px-1">{t('charter.preview')}</p>
          <div className="w-full min-h-[65vh] rounded-xl border bg-card p-6 overflow-auto">
            {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-muted-foreground text-sm">{t('charter.empty')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}