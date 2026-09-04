import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, RefreshCw, Link2, Unlink, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CONNECTOR_ID = '6a9af60572f775821ca82ea6';

export default function GoogleCalendarEvents({ selectedDate }) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const timeMin = new Date(selectedDate + 'T00:00:00').toISOString();
      const timeMax = new Date(selectedDate + 'T23:59:59').toISOString();
      const res = await base44.functions.invoke('getGoogleCalendarEvents', { timeMin, timeMax });
      setEvents(res.data.events || []);
      setConnected(true);
    } catch {
      setConnected(false);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { if (active) setLoading(false); return; }
      await fetchData();
    });
    return () => { active = false; };
  }, [fetchData]);

  const handleConnect = async () => {
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setRefreshing(true);
          fetchData();
        }
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setEvents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> 구글 캘린더 불러오는 중...
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">구글 캘린더 연동</p>
        <p className="text-xs text-muted-foreground mb-3">구글 계정을 연결하면 캘린더 일정을 여기서 볼 수 있어요</p>
        <Button size="sm" onClick={handleConnect}><Link2 className="w-4 h-4 mr-1" /> 구글 계정 연결</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold">구글 캘린더</h2>
          <span className="text-xs text-muted-foreground">· {events.length}개</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setRefreshing(true); fetchData(); }} title="새로고침">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDisconnect} title="연결 해제">
            <Unlink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">이 날의 구글 캘린더 일정이 없어요</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((ev) => {
            const start = ev.start?.dateTime || ev.start?.date;
            const end = ev.end?.dateTime || ev.end?.date;
            const isAllDay = !ev.start?.dateTime;
            return (
              <div key={ev.id} className="flex items-stretch gap-2 p-2 rounded-lg border bg-card text-sm">
                <span className="w-1 self-stretch rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ev.summary || '(제목 없음)'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isAllDay ? '종일' : `${format(parseISO(start), 'HH:mm')} - ${format(parseISO(end), 'HH:mm')}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}