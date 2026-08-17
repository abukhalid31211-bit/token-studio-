import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';

/* ============================================================
   نافذة منبثقة — تكبر من المركز مع خلفية معتمة
   ============================================================ */
export function Modal({
  open,
  onClose,
  children,
  size = 'md',
  locked = false,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** locked: لا تُغلق بالنقر خارجها — تهتز بدلاً من ذلك */
  locked?: boolean;
  title?: ReactNode;
}) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);
  const [shake, setShake] = useState(false);
  const timer = useRef<number | null>(null);

  const close = useCallback(() => {
    if (locked) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    setClosing(true);
    timer.current = window.setTimeout(() => {
      setClosing(false);
      setRender(false);
      onClose();
    }, 170);
  }, [locked, onClose]);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
    } else if (render) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!render) return null;

  return (
    <div
      className={`overlay ${closing ? 'closing' : ''}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={`modal ${size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''} ${shake ? 'shake' : ''}`}>
        {!locked && (
          <button type="button" className="modal-close" onClick={close} aria-label="إغلاق">
            <Icon name="x" size={15} />
          </button>
        )}
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   لوحة جانبية — تنزلق من اليمين
   ============================================================ */
export function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setRender(false);
      onClose();
    }, 240);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
    } else if (render) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!render) return null;

  return (
    <>
      <div className={`drawer-overlay ${closing ? 'closing' : ''}`} onClick={close} />
      <aside className={`drawer ${closing ? 'closing' : ''}`}>
        <button type="button" className="modal-close drawer-close" onClick={close} aria-label="إغلاق">
          <Icon name="x" size={15} />
        </button>
        {title && <h3 className="drawer-title">{title}</h3>}
        {children}
      </aside>
    </>
  );
}

/* ============================================================
   نافذة تأكيد عامة
   ============================================================ */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'تأكيد',
  danger,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}>
      {body && <div style={{ marginBottom: 18 }}>{body}</div>}
      <div className="col" style={{ gap: 9 }}>
        <button type="button" className={`btn btn-block ${danger ? 'btn-danger solid' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
          إلغاء
        </button>
      </div>
    </Modal>
  );
}
