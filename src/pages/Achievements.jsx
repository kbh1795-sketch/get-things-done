import { useRef, useState } from 'react';
import { useAllTasks } from '@/hooks/useTaskData';
import { useSettings } from '@/lib/SettingsContext';
import { computeDailyStreak, computeWeeklyStreak, computeMonthlyStreak, getDayProgress, MILESTONES } from '@/lib/achievements';
import { format } from 'date-fns';
import { shareAchievement, shareToX } from '@/lib/share';
import ShareCard from '@/components/achievements/ShareCard';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Achievements() {
  const { data: tasks = [] } = useAllTasks();
  const { settings } = useSettings();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const { current: dailyStreak, best: bestStreak } = computeDailyStreak(tasks);
  const weeklyStreak = computeWeeklyStreak(tasks, settings.weekStart);
  const monthlyStreak = computeMonthlyStreak(tasks);
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const progress = getDayProgress(tasks, today);

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
        <p className="text-sm opacity-90 mt-1">연속 달성 · 하루 3개+ · 루틴 80% · P1 100%</p>
        <div className="flex justify-center items-center gap-6 mt-4 text-sm">
          <div><p className="font-semibold text-lg">{bestStreak}일</p><p className="opacity-80 text-xs">최장 스트릭</p></div>
          <div className="w-px h-8 bg-white/30" />
          <div><p className="font-semibold text-lg">{weeklyStreak}주</p><p className="opacity-80 text-xs">주간 연속</p></div>
          <div className="w-px h-8 bg-white/30" />
          <div><p className="font-semibold text-lg">{monthlyStreak}개월</p><p className="opacity-80 text-xs">월간 연속</p></div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium mb-3">오늘의 달성 현황</p>
        <div className="space-y-2">
          <CondRow label="3개 이상 완료" status={`${progress.completedCount}개`} done={progress.completedCount >= 3} />
          <CondRow label="루틴 80% 완료" status={`${progress.routineDone}/${progress.routineTotal}`} done={progress.routineTotal === 0 || progress.routineDone / progress.routineTotal >= 0.8} />
          <CondRow label="P1 100% 완료" status={`${progress.p1Done}/${progress.p1Total}`} done={progress.p1Total === 0 || progress.p1Done === progress.p1Total} />
        </div>
        {progress.achieved ? (
          <p className="text-xs text-green-600 font-medium mt-3">오늘 달성 완료! 🎉</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">세 조건을 모두 충족하면 오늘이 스트릭에 추가돼요</p>
        )}
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

function CondRow({ label, status, done }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>{done ? '✓' : '·'}</span>
        {label}
      </span>
      <span className={`text-xs font-medium ${done ? 'text-green-600' : 'text-muted-foreground'}`}>{status}</span>
    </div>
  );
}