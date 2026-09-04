import { useState } from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { useI18n, } from '@/lib/I18nContext';
import { LANGUAGES } from '@/lib/i18n';
import { useAllTasks, useTaskMutations } from '@/hooks/useTaskData';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette, CalendarClock, Bell, LayoutGrid, Settings as SettingsIcon, Moon, Sun, Monitor, Check, Trash2, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const THEMES = [
  { value: 'light', icon: Sun, tkey: 'settings.themeLight' },
  { value: 'dark', icon: Moon, tkey: 'settings.themeDark' },
  { value: 'system', icon: Monitor, tkey: 'settings.themeSystem' },
];

const ACCENTS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#0ea5e9'];

const DATE_FORMATS = [
  { value: 'yyyy. M. d.', label: '2026. 9. 5.' },
  { value: 'M/d/yyyy', label: '9/5/2026' },
  { value: 'MMM d, yyyy', label: 'Sep 5, 2026' },
];

export default function Settings() {
  const { settings, update } = useSettings();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: tasks = [] } = useAllTasks();
  const { deleteCompleted } = useTaskMutations();
  const [notifStatus, setNotifStatus] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingToday = tasks.filter((t) => !t.completed && !t.is_backlog).length;

  const handleClearCompleted = () => {
    if (completedCount === 0) return;
    if (confirm(t('settings.clearConfirm', { n: completedCount }))) deleteCompleted.mutate(user.id);
  };

  const handleNotifications = (enabled) => {
    if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        setNotifStatus(perm);
        update('notificationsEnabled', perm === 'granted');
      });
    } else {
      update('notificationsEnabled', enabled);
    }
  };

  const notifStatusLabel = notifStatus === 'granted' ? t('settings.notifGranted') : notifStatus === 'denied' ? t('settings.notifDenied') : t('settings.notifUnset');

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.entities.Task.deleteMany({ created_by_id: user.id });
      await base44.entities.Project.deleteMany({ created_by_id: user.id });
      await base44.entities.Charter.deleteMany({ created_by_id: user.id });
      await base44.auth.logout();
      navigate('/login');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Section icon={Palette} title={t('settings.appearance')} description={t('settings.appearanceDesc')}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t('settings.theme')}</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((th) => {
                const Icon = th.icon;
                return (
                  <button key={th.value} onClick={() => update('theme', th.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-colors ${settings.theme === th.value ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{t(th.tkey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{t('settings.accent')}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => update('accent', null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${settings.accent === null ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'border-border'}`}
                style={{ backgroundColor: '#171717' }} title={t('settings.accentDefault')}>
                {settings.accent === null && <Check className="w-4 h-4 text-white" />}
              </button>
              {ACCENTS.map((c) => (
                <button key={c} onClick={() => update('accent', c)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${settings.accent === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                  style={{ backgroundColor: c }}>
                  {settings.accent === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} title={t('settings.dateTitle')} description={t('settings.dateDesc')}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t('settings.dateFormat')}</p>
            <div className="grid grid-cols-3 gap-2">
              {DATE_FORMATS.map((f) => (
                <button key={f.value} onClick={() => update('dateFormat', f.value)}
                  className={`py-2 px-2 rounded-lg border-2 text-xs font-medium transition-colors ${settings.dateFormat === f.value ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Row label={t('settings.timeFormat')}>
            <div className="flex gap-2">
              {[{ v: '24h', k: 'settings.time24' }, { v: '12h', k: 'settings.time12' }].map((o) => (
                <button key={o.v} onClick={() => update('timeFormat', o.v)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${settings.timeFormat === o.v ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {t(o.k)}
                </button>
              ))}
            </div>
          </Row>
          <Row label={t('settings.weekStart')}>
            <div className="flex gap-2">
              {[{ v: 0, k: 'settings.weekSun' }, { v: 1, k: 'settings.weekMon' }].map((o) => (
                <button key={o.v} onClick={() => update('weekStart', o.v)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${settings.weekStart === o.v ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {t(o.k)}
                </button>
              ))}
            </div>
          </Row>
        </div>
      </Section>

      <Section icon={Bell} title={t('settings.notifTitle')} description={t('settings.notifDesc')}>
        <div className="space-y-1">
          <Row label={t('settings.sound')} description={t('settings.soundDesc')}>
            <Switch checked={settings.soundEnabled} onCheckedChange={(c) => update('soundEnabled', c)} />
          </Row>
          <Row label={t('settings.notifications')} description={notifStatus === 'unsupported' ? t('settings.notifUnsupported') : t('settings.notifPermission', { status: notifStatusLabel })}>
            <Switch checked={settings.notificationsEnabled} onCheckedChange={handleNotifications} disabled={notifStatus === 'denied'} />
          </Row>
        </div>
      </Section>

      <Section icon={LayoutGrid} title={t('settings.widgetTitle')} description={t('settings.widgetDesc')}>
        <div className="space-y-4">
          <Row label={t('settings.compact')} description={t('settings.compactDesc')}>
            <Switch checked={settings.compactMode} onCheckedChange={(c) => update('compactMode', c)} />
          </Row>
          <div className={`rounded-2xl p-4 bg-gradient-to-br from-primary/10 to-primary/5 border ${settings.compactMode ? 'max-w-[200px]' : ''}`}>
            <p className="text-xs text-muted-foreground mb-1">{t('settings.widgetToday')}</p>
            <p className="text-3xl font-bold">{remainingToday}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('settings.widgetRemaining')}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t('settings.widgetHint')}</p>
        </div>
      </Section>

      <Section icon={SettingsIcon} title={t('settings.general')} description={t('settings.generalDesc')}>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{t('settings.language')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
            <Select value={settings.language} onValueChange={(v) => update('language', v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="text-sm font-medium">{t('settings.clearCompleted')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.clearCompletedDesc', { n: completedCount })}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearCompleted} disabled={completedCount === 0}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('settings.clear')}
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="text-sm font-medium">{t('settings.appInfo')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.appVersion')}</p>
            </div>
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </Section>

      <Section icon={Trash2} title={t('settings.deleteAccount')} description={t('settings.deleteAccountDesc')}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-1" /> {deleting ? t('settings.deleting') : t('settings.deleteAccountBtn')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.deleteAccountConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('settings.deleteAccountWarning')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('settings.deleteAccountBtn')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}