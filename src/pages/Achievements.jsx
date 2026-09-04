import { useRef, useState } from 'react';
import { useAllTasks } from '@/hooks/useTaskData';
import { useSettings } from '@/lib/SettingsContext';
import { computeDailyStreak, computeWeeklyStreak, computeMonthlyStreak, MILESTONES } from '@/lib/achievements';
import { shareAchievement, shareToX } from '@/lib/share';
import ShareCard from '@/components/achievements/ShareCard';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Share2, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Achievements() {
  const { data: tasks = [] } = useAllTasks();
  const { settings, update } = useSettings();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const dailyGoal = settings.dailyGoal || 1;
  const { current: dailyStreak, best: bestStreak } = computeDailyStreak(tasks, dailyGoal);
  const weeklyStreak = computeWeeklyStreak(tasks, settings.weekStart);
  const monthlyStreak = computeMonthlyStreak(tasks);
  const totalCompleted = tasks.filter((t) => t.completed).length;

  const shareText = `🔥 ${dailyStreak}일 연속 할 일 달성! 총 ${totalCompleted}개 완료. 마이태스크와 함께 나만의 리듬을 만들어가는 중입니다. #마이태스크 #할일달성`;

  const handleShare = async () => {
    setSharing(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      await shareAchievement(cardRef.current, shareText);
    } finally { setSharing(false); }
  };

  const handleX = () => {
    confetti({ particleCount: 60, spread: 60 });
    shareToX(shareText);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">성취</h1>
        <p className="text-sm text-muted-foreground">연속 달성과 마일스톤으로 동기를 얻으세요</p>
      </div>

      <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white text-center">
        <Flame className="w-10 h-10 mx-auto mb-2" />
        <p className="text-5xl font-bold">{dailyStreak}<span className="text-2xl ml-1">일</span></p>
        <p className="text-sm opacity-90 mt-1">연속 달성 (목표: 하루 {dailyGoal}개)</p>
        <div className="flex justify-center items-center gap-6 mt-4 text-sm">
          <div><p className="font-semibold text-lg">{bestStreak}일</p><p className="opacity-80 text-xs">최장 스트릭</p></div>
          <div className="w-px h-8 bg-white/30" />
          <div><p className="font-semibold text-lg">{weeklyStreak}주</p><p className="opacity-80 text-xs">주간 연속</p></div>
          <div className="w-px h-8 bg-white/30" />
          <div><p className="font-semibold text-lg">{monthlyStreak}개월</p><p className="opacity-80 text-xs">월간 연속</p></div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-1"><Target className="w-4 h-4" /> 일일 목표</p>
          <p className="text-xs text-muted-foreground">하루에 완료할 할 일 개수</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => update('dailyGoal', Math.max(1, dailyGoal - 1))} className="w-8 h-8 rounded-lg border hover:bg-muted text-lg leading-none">−</button>
          <span className="w-8 text-center font-semibold">{dailyGoal}</span>
          <button onClick={() => update('dailyGoal', dailyGoal + 1)} className="w-8 h-8 rounded-lg border hover:bg-muted text-lg leading-none">+</button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium mb-1 flex items-center gap-1"><Share2 className="w-4 h-4" /> 성과 공유하기</p>
        <p className="text-xs text-muted-foreground mb-3">인스타그램이나 X에 내 스트릭을 자랑하세요 (모바일에서 공유 시 앱 선택, 데스크톱에서는 이미지 저장 + X 열기)</p>
        <div className="flex gap-2">
          <Button onClick={handleShare} disabled={sharing} className="flex-1">
            <Share2 className="w-4 h-4 mr-1" /> {sharing ? '준비 중...' : '공유하기'}
          </Button>
          <Button onClick={handleX} variant="outline">
            <span className="mr-1 font-bold">𝕏</span> X에 공유
          </Button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-1"><Trophy className="w-4 h-4" /> 마일스톤</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MILESTONES.map((m) => {
            const value = m.type === 'streak' ? bestStreak : totalCompleted;
            const achieved = value >= m.threshold;
            const progress = Math.min(100, Math.round((value / m.threshold) * 100));
            return (
              <div key={m.id} className={`rounded-xl border p-4 text-center ${achieved ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-card'}`}>
                <div className={`text-3xl mb-1 ${achieved ? '' : 'grayscale opacity-50'}`}>{m.emoji}</div>
                <p className="text-sm font-medium">{m.label}</p>
                {achieved ? (
                  <p className="text-xs text-amber-600 font-medium mt-1">달성 ✓</p>
                ) : (
                  <>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{value}/{m.threshold}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }} aria-hidden>
        <ShareCard cardRef={cardRef} streak={dailyStreak} totalCompleted={totalCompleted} bestStreak={bestStreak} />
      </div>
    </div>
  );
}