import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';
import { copyText } from '../../lib/format';
import { useApp } from '../../state/AppContext';

/* ---------- مفتاح تبديل ---------- */
export function Toggle({
  on,
  onChange,
  disabled,
  label,
}: {
  on: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <span className="row" style={{ gap: 9 }}>
      {label && <span className="small muted bold">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        className={`switch ${on ? 'on' : ''}`}
        onClick={() => onChange?.(!on)}
      />
    </span>
  );
}

/* ---------- تبويبات مع مؤشر منزلق ---------- */
export function Tabs({
  items,
  active,
  onChange,
  mini,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  mini?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`);
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, items]);

  useEffect(() => {
    const onResize = () => {
      const el = wrapRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`);
      if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  return (
    <div className={`tabs ${mini ? 'mini' : ''}`} ref={wrapRef}>
      {items.map((t) => (
        <button
          key={t.id}
          data-tab={t.id}
          className={`tab-btn ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
      <span className="tabs-indicator" style={{ left: ind.left, width: ind.width }} />
    </div>
  );
}

/* ---------- أكورديون قابل للطي ---------- */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <button type="button" className={`accordion-head ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <Icon name="chevDown" size={17} />
      </button>
      <div className={`accordion-body ${open ? 'open' : ''}`}>
        <div>
          <div className="accordion-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- شريط تقدم ---------- */
export function ProgressBar({ pct, thin }: { pct: number; thin?: boolean }) {
  return (
    <div className={`progress ${thin ? 'thin' : ''}`}>
      <div className="fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

/* ---------- حلقة تقدم دائرية ---------- */
export function ProgressRing({
  pct,
  size = 130,
  stroke = 10,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#232748" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, pct)) / 100}
          style={{ transition: 'stroke-dashoffset 0.45s ease' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

/* ---------- عدّاد تصاعدي ---------- */
export function CountUp({ value, prefix = '', suffix = '', duration = 900 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return (
    <span>
      {prefix}
      {new Intl.NumberFormat('en-US').format(n)}
      {suffix}
    </span>
  );
}

/* ---------- زر نسخ ---------- */
export function CopyBtn({ text, small, label }: { text: string; small?: boolean; label?: string }) {
  const { toast } = useApp();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={small ? 'tool-btn' : 'btn btn-sm btn-outline'}
      style={small ? { padding: '4px 8px' } : undefined}
      onClick={() => {
        copyText(text).then(() => {
          setDone(true);
          toast('success', label ? `تم نسخ ${label}` : 'تم النسخ ✅');
          setTimeout(() => setDone(false), 1200);
        });
      }}
    >
      <Icon name={done ? 'check' : 'copy'} size={13} style={{ color: done ? 'var(--success)' : undefined }} />
      {label && <span>{done ? 'تم' : label}</span>}
    </button>
  );
}

/* ---------- ترقيم الصفحات ---------- */
export function Pagination({
  page,
  pages,
  onPage,
  perPage,
  onPerPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
  perPage: number;
  onPerPage: (n: number) => void;
}) {
  const nums: number[] = [];
  for (let i = 1; i <= Math.max(1, pages); i++) nums.push(i);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        → السابق
      </button>
      {nums.slice(0, 5).map((n) => (
        <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => onPage(n)}>
          {n}
        </button>
      ))}
      <button className="page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        التالي ←
      </button>
      <div className="grow" />
      <select className="input" style={{ width: 120, padding: '7px 12px', fontSize: 12.5 }} value={perPage} onChange={(e) => onPerPage(Number(e.target.value))}>
        {[10, 25, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n} صفاً
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- حالة فارغة ---------- */
export function Empty({ text }: { text: string }) {
  return (
    <div className="center" style={{ padding: '40px 0', color: 'var(--text-3)' }}>
      <Icon name="search" size={30} style={{ opacity: 0.5, marginBottom: 10 }} />
      <div className="bold">{text}</div>
    </div>
  );
}
