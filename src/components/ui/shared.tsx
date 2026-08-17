import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { ScreenId } from '../../state/AppContext';

/* ============================================================
   مسار التنقل الداخلي (Breadcrumb)
   ============================================================ */
export function Breadcrumb({ items }: { items: { label: string; to?: ScreenId }[] }) {
  const { go } = useApp();
  return (
    <nav className="breadcrumb" aria-label="مسار التنقل">
      {items.map((it, i) => (
        <span key={it.label + i} className="crumb-part">
          {it.to ? (
            <button type="button" className="crumb-link" onClick={() => go(it.to!)}>
              {it.label}
            </button>
          ) : (
            <span className="crumb-current">{it.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chevLeft" size={13} className="crumb-sep" />}
        </span>
      ))}
    </nav>
  );
}

/* ============================================================
   رأس الشاشة: عنوان + وصف + إجراءات
   ============================================================ */
export function PageHead({
  title,
  sub,
  actions,
  backTo,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
  backTo?: ScreenId;
}) {
  const { go } = useApp();
  return (
    <div className="page-head">
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 10 }}>
          {backTo && (
            <button type="button" className="icon-btn sm" onClick={() => go(backTo)} aria-label="رجوع">
              <Icon name="arrowRight" size={16} />
            </button>
          )}
          <h1 className="section-title" style={{ marginBottom: 0 }}>{title}</h1>
        </div>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="page-head-actions">{actions}</div>}
    </div>
  );
}

/* ============================================================
   قائمة سياقية (⋮)
   ============================================================ */
export interface MenuAction {
  label: string;
  icon?: IconName;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function ContextMenu({ actions, label = 'إجراءات', align = 'start' }: { actions: MenuAction[]; label?: string; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="icon-btn sm"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Icon name="dotsV" size={16} />
      </button>
      {open && (
        <div className={`dropdown-menu small ${align === 'end' ? 'align-end' : ''}`}>
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`dropdown-item ${a.danger ? 'danger' : ''}`}
              disabled={a.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                a.onClick();
              }}
            >
              {a.icon && <Icon name={a.icon} size={15} />} {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   قائمة منسدلة عامة (فرز / تصدير / صفوف)
   ============================================================ */
export function MenuButton({
  label,
  icon,
  items,
  active,
  variant = 'outline',
}: {
  label: string;
  icon?: IconName;
  items: { id: string; label: string; onClick: () => void }[];
  active?: string;
  variant?: 'outline' | 'primary' | 'ghost';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className={`btn btn-sm btn-${variant}`} onClick={() => setOpen((v) => !v)}>
        {icon && <Icon name={icon} size={14} />} {label} <Icon name="chevDown" size={13} />
      </button>
      {open && (
        <div className="dropdown-menu small align-end">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`dropdown-item ${active === it.id ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
            >
              {active === it.id && <Icon name="check" size={14} className="green" />}
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   حالات فارغة / خطأ داخل الشاشة
   ============================================================ */
export function EmptyState({
  icon = 'file',
  title,
  hint,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  tone = 'neutral',
}: {
  icon?: IconName;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: 'neutral' | 'error' | 'warning';
}) {
  return (
    <div className={`empty-state ${tone}`}>
      <div className="empty-illus">
        <Icon name={icon} size={34} />
      </div>
      <h3 className="empty-title">{title}</h3>
      {hint && <p className="empty-hint">{hint}</p>}
      {(actionLabel || secondaryLabel) && (
        <div className="row" style={{ justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          {actionLabel && (
            <button type="button" className="btn btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {secondaryLabel && (
            <button type="button" className="btn btn-outline" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   الهياكل العظمية للتحميل
   ============================================================ */
export function SkeletonCards({ count = 4, height = 96 }: { count?: number; height?: number }) {
  return (
    <div className="stats-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height, borderRadius: 14 }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card table-card" style={{ padding: 16 }}>
      <div className="shimmer" style={{ height: 30, marginBottom: 12 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 20, marginBottom: 10, opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="col" style={{ gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 62, borderRadius: 12 }} />
      ))}
    </div>
  );
}

/* ============================================================
   شريط تعديلات غير محفوظة (سفلي)
   ============================================================ */
export function UnsavedBar({ show, onSave, onCancel, saving }: { show: boolean; onSave: () => void; onCancel: () => void; saving?: boolean }) {
  if (!show) return null;
  return (
    <div className="unsaved-bar">
      <Icon name="warning" size={16} />
      <span className="grow">لديك تعديلات غير محفوظة</span>
      <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
        إلغاء التعديلات
      </button>
      <button type="button" className="btn btn-sm btn-primary" onClick={onSave} disabled={saving}>
        {saving ? <span className="spin" /> : <Icon name="check" size={14} />} حفظ
      </button>
    </div>
  );
}

/* ============================================================
   بطاقة معلومة صغيرة (مؤشر حالة)
   ============================================================ */
export function StatCard({
  icon,
  tone = 'green',
  label,
  value,
  hint,
  onClick,
}: {
  icon: IconName;
  tone?: 'green' | 'blue' | 'yellow' | 'red';
  label: string;
  value: ReactNode;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}>
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} size={22} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="tiny faint">{hint}</div>}
      </div>
    </div>
  );
}

/* ============================================================
   حقل نموذج موحّد بحالات التحقق
   ============================================================ */
export function Field({
  label,
  hint,
  error,
  ok,
  required,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  ok?: string | null;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="field-error">
          <Icon name="warning" size={13} /> {error}
        </div>
      )}
      {!error && ok && (
        <div className="field-ok">
          <Icon name="check" size={13} /> {ok}
        </div>
      )}
      {!error && !ok && hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

/* ============================================================
   صف بيانات (مفتاح/قيمة) داخل البطاقات
   ============================================================ */
export function KV({ k, v, mono, tone }: { k: string; v: ReactNode; mono?: boolean; tone?: 'green' | 'red' | 'yellow' }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className={`v ${tone ?? ''} ${mono ? 'mono-cell' : ''}`}>{v}</span>
    </div>
  );
}

/* ============================================================
   شارة حالة عامة
   ============================================================ */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    success: { cls: 'green', label: 'ناجحة' },
    confirmed: { cls: 'green', label: 'مؤكدة' },
    pending: { cls: 'yellow', label: 'قيد الانتظار' },
    failed: { cls: 'red', label: 'فاشلة' },
    published: { cls: 'blue', label: 'منشور' },
    verified: { cls: 'green', label: 'موثّق' },
    draft: { cls: 'gray', label: 'مسودة' },
    open: { cls: 'blue', label: 'مفتوحة' },
    processing: { cls: 'yellow', label: 'قيد المعالجة' },
    closed: { cls: 'gray', label: 'مغلقة' },
  };
  const m = map[status] ?? { cls: 'gray', label: status };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

/* ============================================================
   منطقة رفع ملف
   ============================================================ */
export function FileDrop({
  accept,
  hint,
  fileName,
  onFile,
}: {
  accept?: string;
  hint?: string;
  fileName?: string | null;
  onFile: (name: string, content: string) => void;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const read = (f: File) => {
    const r = new FileReader();
    r.onload = () => onFile(f.name, String(r.result ?? ''));
    r.readAsText(f);
  };

  return (
    <div
      className={`file-drop ${over ? 'over' : ''} ${fileName ? 'has-file' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) read(f);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) read(f);
          e.target.value = '';
        }}
      />
      <Icon name={fileName ? 'file' : 'download'} size={24} />
      <div className="bold">{fileName ?? 'اسحب الملف هنا أو اضغط للاختيار'}</div>
      {hint && <div className="tiny faint">{hint}</div>}
    </div>
  );
}
