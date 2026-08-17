import { useEffect, useState } from 'react';
import type { ChartDay } from '../../data/mock';
import { fmt } from '../../lib/format';

/* ============================================================
   رسم بياني دائري (Donut) مع تأثير دوراني عند التحميل
   ============================================================ */
export interface DonutSeg {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  segments,
  size = 168,
  thickness = 22,
  center,
}: {
  segments: DonutSeg[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0); // 0→1 عند التحميل
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 850);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness - 8) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#20264a" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c * progress;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={hover === i ? thickness + 5 : thickness}
              strokeDasharray={`${Math.max(0, dash - 2)} ${c}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-width 0.15s ease, opacity 0.2s', cursor: 'pointer', opacity: hover === null || hover === i ? 1 : 0.45 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
          offset += frac * c * progress;
          return el;
        })}
      </svg>
      <div className="donut-center">
        {hover !== null ? (
          <div style={{ fontSize: 11, fontWeight: 700, maxWidth: size - 60 }}>
            <div style={{ color: segments[hover].color }}>{segments[hover].label}</div>
            <div className="muted">{fmt(segments[hover].value)}</div>
          </div>
        ) : (
          center
        )}
      </div>
    </div>
  );
}

/* ============================================================
   رسم بياني شريطي مجمّع (أعمدة تنمو من الأسفل + تلميحات)
   ============================================================ */
export function BarsChart({ data }: { data: ChartDay[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [visible, setVisible] = useState({ mint: true, send: true, failed: true });

  const W = 760;
  const H = 240;
  const pad = 30;
  const groupW = (W - pad * 2) / data.length;
  const max = Math.max(...data.map((d) => Math.max(d.mint, d.send, d.failed * 500_000)), 1);

  const series: { key: 'mint' | 'send' | 'failed'; color: string; label: string }[] = [
    { key: 'mint', color: '#00d09c', label: 'السك' },
    { key: 'send', color: '#3b82f6', label: 'الإرسال' },
    { key: 'failed', color: '#ef4444', label: 'الفاشلة' },
  ];

  const activeSeries = series.filter((s) => visible[s.key]);

  return (
    <div>
      <div className="bars-chart" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 520 }} onMouseLeave={() => setTip(null)}>
          {/* خطوط الشبكة */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line key={p} x1={pad} x2={W - pad} y1={H - 26 - p * (H - 60)} y2={H - 26 - p * (H - 60)} stroke="rgba(255,255,255,0.05)" />
          ))}
          {data.map((d, gi) => {
            const gx = pad + gi * groupW;
            const bw = Math.min(20, (groupW * 0.55) / Math.max(1, activeSeries.length));
            const startX = gx + (groupW - bw * activeSeries.length - (activeSeries.length - 1) * 3) / 2;
            return (
              <g key={gi}>
                {activeSeries.map((s, si) => {
                  const raw = d[s.key];
                  const val = s.key === 'failed' ? raw * 500_000 : raw;
                  const h = Math.max(raw > 0 ? 4 : 0, (val / max) * (H - 60));
                  return (
                    <rect
                      key={s.key}
                      className="bar-rect bar-hit"
                      x={startX + si * (bw + 3)}
                      y={H - 26 - h}
                      width={bw}
                      height={h}
                      rx={3}
                      fill={s.color}
                      style={{ animationDelay: `${gi * 0.05 + si * 0.04}s`, transformBox: 'fill-box' }}
                      onMouseMove={(e) =>
                        setTip({
                          x: e.clientX,
                          y: e.clientY,
                          text: `${d.label} — ${s.label}: ${s.key === 'failed' ? `${raw} معاملة` : fmt(raw) + ' وحدة'}`,
                        })
                      }
                    />
                  );
                })}
                <text x={gx + groupW / 2} y={H - 8} textAnchor="middle" fontSize={10.5} fill="#6b7280" fontWeight={700}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* المفاتيح */}
      <div className="row mt-sm" style={{ gap: 16, justifyContent: 'center' }}>
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            className="row"
            style={{ gap: 7, background: 'none', border: 'none', cursor: 'pointer', opacity: visible[s.key] ? 1 : 0.35, color: 'var(--text-2)', fontSize: 12.5, fontWeight: 700, transition: 'opacity 0.15s' }}
            onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
          >
            <span style={{ width: 12, height: 12, borderRadius: 4, background: s.color, display: 'inline-block' }} />
            {s.label}
          </button>
        ))}
      </div>

      {tip && (
        <div className="chart-tip" style={{ left: tip.x + 12, top: tip.y - 38 }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}
