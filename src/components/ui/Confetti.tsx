import { useEffect, useState } from 'react';

const COLORS = ['#00d09c', '#3b82f6', '#f59e0b', '#ef4444', '#c084fc', '#10b981', '#facc15'];

/* تأثير confetti — جزيئات ملونة تتساقط */
export function Confetti({ run }: { run: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; dur: number; color: string; rot: number }[]>([]);

  useEffect(() => {
    if (!run) return;
    setPieces(
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        dur: 1 + Math.random() * 0.8,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 360,
      })),
    );
    const t = setTimeout(() => setPieces([]), 2000);
    return () => clearTimeout(t);
  }, [run]);

  if (!pieces.length) return null;
  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left + '%',
            background: p.color,
            animationDuration: p.dur + 's',
            animationDelay: p.delay + 's',
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* انفجار جزيئات خضراء — لنجاح السك/الإرسال */
export function Burst({ run }: { run: boolean }) {
  if (!run) return null;
  return (
    <div className="particles">
      {Array.from({ length: 16 }, (_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        const dist = 60 + Math.random() * 60;
        return (
          <span
            key={i}
            className="particle"
            style={{
              ['--dx' as string]: Math.cos(ang) * dist + 'px',
              ['--dy' as string]: Math.sin(ang) * dist + 'px',
              animationDelay: Math.random() * 0.1 + 's',
            }}
          />
        );
      })}
    </div>
  );
}
