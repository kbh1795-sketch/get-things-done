import { useState } from 'react';
import { useSettings } from '@/lib/SettingsContext';
import { useAllTasks, useTaskMutations } from '@/hooks/useTaskData';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette, CalendarClock, Bell, LayoutGrid, Settings as SettingsIcon, Moon, Sun, Monitor, Check, Trash2, Smartphone, Sparkles, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const THEMES = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
];

const ACCENTS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#0ea5e9'];

const DATE_FORMATS = [
  { value: 'yyyy. M. d.', label: '2026. 9. 5.' },
  { value: 'M/d/yyyy', label: '9/5/2026' },
  { value: 'MMM d, yyyy', label: 'Sep 5, 2026' },
];

const PETS = [
  { value: 'cat', emoji: '🐱' },
  { value: 'dog', emoji: '🐶' },
  { value: 'kangaroo', emoji: '🦘' },
  { value: 'lemur', emoji: '🐒' },
  { value: 'quokka', emoji: '🦦' },
  { value: 'koala', emoji: '🐨' },
  { value: 'hedgehog', emoji: '🦔' },
  { value: 'rabbit', emoji: '🐰' },
  { value: 'masterRabbit', emoji: '🐇' },
];

const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

export default function Settings() {
  const { settings, update } = useSettings();
  const { user } = useAuth();
  const { data: tasks = [] } = useAllTasks();
  const { deleteCompleted } = useTaskMutations();
  const [notifStatus, setNotifStatus] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingToday = tasks.filter((t) => !t.completed && !t.is_backlog).length;

  const handleClearCompleted = () => {
    if (completedCount === 0) return;
    if (confirm(`${completedCount}개의 완료된 할 일을 삭제하시겠습니까?`)) deleteCompleted.mutate(user.id);
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

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">앱을 나에게 맞게 커스터마이즈하세요</p>
      </div>

      <Section icon={Palette} title="Appearance" description="테마와 강조색을 설정하세요">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">테마</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => update('theme', t.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-colors ${settings.theme === t.value ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">강조색</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => update('accent', null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${settings.accent === null ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'border-border'}`}
                style={{ backgroundColor: '#171717' }} title="기본">
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

      <Section icon={CalendarClock} title="Date & Time" description="날짜와 시간 표시 형식을 설정하세요">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">날짜 형식</p>
            <div className="grid grid-cols-3 gap-2">
              {DATE_FORMATS.map((f) => (
                <button key={f.value} onClick={() => update('dateFormat', f.value)}
                  className={`py-2 px-2 rounded-lg border-2 text-xs font-medium transition-colors ${settings.dateFormat === f.value ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Row label="시간 형식" description="12시간 / 24시간">
            <div className="flex gap-2">
              {[{ v: '24h', l: '24시간' }, { v: '12h', l: '12시간' }].map((o) => (
                <button key={o.v} onClick={() => update('timeFormat', o.v)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${settings.timeFormat === o.v ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </Row>
          <Row label="주 시작 요일" description="달력 및 그룹화 기준">
            <div className="flex gap-2">
              {[{ v: 0, l: '일요일' }, { v: 1, l: '월요일' }].map((o) => (
                <button key={o.v} onClick={() => update('weekStart', o.v)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${settings.weekStart === o.v ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </Row>
        </div>
      </Section>

      <Section icon={Bell} title="Sounds & Notifications" description="알림음과 알림을 관리하세요">
        <div className="space-y-1">
          <Row label="완료 알림음" description="할 일 완료 시 효과음 재생">
            <Switch checked={settings.soundEnabled} onCheckedChange={(c) => update('soundEnabled', c)} />
          </Row>
          <Row label="알림" description={notifStatus === 'unsupported' ? '이 브라우저에서는 지원되지 않아요' : `권한: ${notifStatus === 'granted' ? '허용됨' : notifStatus === 'denied' ? '차단됨' : '미설정'}`}>
            <Switch checked={settings.notificationsEnabled} onCheckedChange={handleNotifications} disabled={notifStatus === 'denied'} />
          </Row>
        </div>
      </Section>

      <Section icon={LayoutGrid} title="Widget" description="홈 화면 위젯 미리보기">
        <div className="space-y-4">
          <Row label="컴팩트 위젯" description="작은 크기의 위젯 사용">
            <Switch checked={settings.compactMode} onCheckedChange={(c) => update('compactMode', c)} />
          </Row>
          <div className={`rounded-2xl p-4 bg-gradient-to-br from-primary/10 to-primary/5 border ${settings.compactMode ? 'max-w-[200px]' : ''}`}>
            <p className="text-xs text-muted-foreground mb-1">오늘의 할 일</p>
            <p className="text-3xl font-bold">{remainingToday}</p>
            <p className="text-xs text-muted-foreground mt-1">남은 할 일</p>
          </div>
          <p className="text-xs text-muted-foreground">위젯은 모바일 앱 설치 시 홈 화면에 추가할 수 있어요</p>
        </div>
      </Section>

      <Section icon={Sparkles} title="Pet" description="나만의 펫을 설정하세요">
        <div className="space-y-4">
          <Row label="펫 활성화" description="앱을 열면 펫이 인사해요">
            <Switch checked={settings.petEnabled} onCheckedChange={(c) => update('petEnabled', c)} />
          </Row>
          <div>
            <p className="text-sm font-medium mb-2">펫 종류</p>
            <div className="flex flex-wrap gap-2">
              {PETS.map((p) => (
                <button key={p.value} onClick={() => update('petType', p.value)}
                  className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition-all ${settings.petType === p.value ? 'border-primary bg-primary/5 scale-110' : 'border-border hover:bg-muted'}`}>
                  {p.emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">펫 이름</p>
            <Input value={settings.petName || ''} onChange={(e) => update('petName', e.target.value)} placeholder="이름을 지어주세요" maxLength={12} />
          </div>
        </div>
      </Section>

      <Section icon={SettingsIcon} title="General" description="일반 설정">
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">언어</p>
              <p className="text-xs text-muted-foreground">펫 메시지 언어</p>
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
              <p className="text-sm font-medium">완료된 할 일 삭제</p>
              <p className="text-xs text-muted-foreground">{completedCount}개 완료됨</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearCompleted} disabled={completedCount === 0}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> 삭제
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <p className="text-sm font-medium">앱 정보</p>
              <p className="text-xs text-muted-foreground">마이태스크 v1.0</p>
            </div>
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
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