import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ShareCard({ cardRef, streak, totalCompleted, bestStreak }) {
  return (
    <div ref={cardRef} style={{
      width: 1080, height: 1080,
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'sans-serif', padding: 80, boxSizing: 'border-box',
    }}>
      <p style={{ fontSize: 40, opacity: 0.9, letterSpacing: 2, marginBottom: 20 }}>🔥 마이태스크</p>
      <p style={{ fontSize: 200, fontWeight: 800, lineHeight: 1 }}>{streak}</p>
      <p style={{ fontSize: 48, opacity: 0.95, marginTop: 8 }}>일 연속 달성!</p>
      <div style={{ display: 'flex', gap: 60, marginTop: 60, fontSize: 36 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700 }}>{totalCompleted}</div>
          <div style={{ fontSize: 22, opacity: 0.8 }}>총 완료</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700 }}>{bestStreak}</div>
          <div style={{ fontSize: 22, opacity: 0.8 }}>최장 스트릭</div>
        </div>
      </div>
      <p style={{ fontSize: 28, opacity: 0.7, marginTop: 80 }}>
        {format(new Date(), 'yyyy년 M월 d일', { locale: ko })}
      </p>
    </div>
  );
}