import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ children, onRefresh, className }) {
  const ref = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = (e) => {
    if (ref.current && ref.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = (e) => {
    if (!pulling.current || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && ref.current && ref.current.scrollTop <= 0) {
      setPull(Math.min(delta * 0.5, 80));
    }
  };

  const onTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull > 60) {
      setRefreshing(true);
      setPull(60);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  return (
    <div ref={ref} className={className} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div style={{ transform: `translateY(${pull}px)`, transition: pulling.current && !refreshing ? 'none' : 'transform 0.2s ease-out' }}>
        {(pull > 10 || refreshing) && (
          <div className="flex justify-center py-2">
            <Loader2 className={`w-5 h-5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}