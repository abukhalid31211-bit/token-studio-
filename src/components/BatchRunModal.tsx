import { useEffect, useRef, useState } from 'react';
import { Modal } from './ui/Modal';
import { ProgressBar } from './ui/primitives';
import { Icon } from '../lib/icons';
import { fmt } from '../lib/format';
import { useApp } from '../state/AppContext';

export interface BatchRow {
  id: number;
  addr: string;
  amount: number;
}

type RowState = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

/* ============================================================
   نافذة تنفيذ جماعي — تُحاكي الإرسال المتسلسل في الوقت الفعلي
   ============================================================ */
export function BatchRunModal({
  open,
  title,
  rows,
  verb,
  onClose,
  onDone,
}: {
  open: boolean;
  title: string;
  rows: BatchRow[];
  verb: string; // مثال: "سك" أو "إرسال"
  onClose: () => void;
  /** يُستدعى مرة واحدة عند اكتمال التنفيذ بنجاح */
  onDone?: (total: number) => void;
}) {
  const { toast } = useApp();
  const [phase, setPhase] = useState<'confirm' | 'running' | 'done'>('confirm');
  const [states, setStates] = useState<RowState[]>([]);
  const [txs, setTxs] = useState<string[]>([]);
  const timerRef = useRef<number[]>([]);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const idxRef = useRef(0);

  const total = rows.reduce((s, r) => s + r.amount, 0);

  const clearTimers = () => {
    timerRef.current.forEach((t) => clearTimeout(t));
    timerRef.current = [];
  };

  useEffect(() => {
    if (open) {
      setPhase('confirm');
      setStates(rows.map(() => 'pending'));
      setTxs(rows.map(() => ''));
      setPaused(false);
      pausedRef.current = false;
      idxRef.current = 0;
    } else {
      clearTimers();
    }
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const step = (i: number) => {
    if (i >= rows.length) {
      setPhase('done');
      toast('success', `اكتمل ${verb} الجماعي ✅`);
      onDone?.(total);
      return;
    }
    idxRef.current = i;
    setStates((s) => s.map((v, j) => (j === i ? 'running' : v)));
    const t = window.setTimeout(() => {
      if (pausedRef.current) return; // يستأنف من زر استئناف
      const ok = Math.random() > 0.06; // فشل نادر عشوائي
      const hash = (Math.random().toString(16) + '0000000').slice(2, 10);
      setTxs((tx) => tx.map((v, j) => (j === i ? `TX:${hash}..` : v)));
      setStates((s) => s.map((v, j) => (j === i ? (ok ? 'done' : 'failed') : v)));
      const t2 = window.setTimeout(() => step(i + 1), 350);
      timerRef.current.push(t2);
    }, 650 + Math.random() * 500);
    timerRef.current.push(t);
  };

  const start = () => {
    setPhase('running');
    step(0);
  };

  const doneCount = states.filter((s) => s === 'done' || s === 'failed' || s === 'skipped').length;
  const successCount = states.filter((s) => s === 'done').length;
  const pct = rows.length ? (doneCount / rows.length) * 100 : 0;

  const togglePause = () => {
    setPaused((p) => {
      const next = !p;
      pausedRef.current = next;
      if (!next) {
        // استئناف
        const i = idxRef.current;
        setStates((s) => (s[i] === 'running' ? s.map((v, j) => (j === i ? 'done' : v)) : s));
        const t = window.setTimeout(() => step(i + 1), 300);
        timerRef.current.push(t);
      }
      return next;
    });
  };

  const skipCurrent = () => {
    const i = idxRef.current;
    setStates((s) => s.map((v, j) => (j === i ? 'skipped' : v)));
    pausedRef.current = false;
    setPaused(false);
    clearTimers();
    step(i + 1);
  };

  const cancelAll = () => {
    clearTimers();
    onClose();
    toast('warning', 'تم إلغاء العملية ⏹');
  };

  const stateIcon = (s: RowState) => {
    if (s === 'done') return <span className="dot green" />;
    if (s === 'running') return <span className="spin" style={{ width: 13, height: 13, color: 'var(--warning)', borderWidth: 2 }} />;
    if (s === 'failed') return <span className="dot red" data-tip="فشل: تجاوز حد الغاز" />;
    if (s === 'skipped') return <span className="dot yellow" />;
    return <span className="dot gray" />;
  };

  const stateText = (s: RowState) =>
    s === 'done' ? '✅' : s === 'running' ? 'جارٍ الإرسال...' : s === 'failed' ? '❌' : s === 'skipped' ? '⏭ تم التخطي' : 'في الانتظار ⏸';

  return (
    <Modal
      open={open}
      onClose={phase === 'running' ? () => undefined : onClose}
      locked={phase === 'running'}
      size="lg"
      title={
        phase === 'confirm' ? (
          title
        ) : phase === 'running' ? (
          <span className="row" style={{ gap: 9 }}>جارٍ التنفيذ... <span className="spin" style={{ width: 15, height: 15, borderWidth: 2 }} /></span>
        ) : (
          <span className="row green" style={{ gap: 9 }}><Icon name="check" size={19} strokeWidth={3} /> اكتمل التنفيذ</span>
        )
      }
    >
      {phase === 'confirm' && (
        <>
          <p className="muted mb" style={{ fontSize: 14 }}>
            {verb} لـ <b className="green">{rows.length}</b> مستلمين — الإجمالي:{' '}
            <b className="green">{fmt(total)} وحدة</b>
          </p>
          <div className="col" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary btn-block" onClick={start}>تأكيد</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>إلغاء</button>
          </div>
        </>
      )}

      {phase === 'running' && (
        <>
          <div className="row between mb-sm small bold">
            <span>{doneCount} / {rows.length} مكتملة</span>
            <span className="green">{Math.round(pct)}%</span>
          </div>
          <ProgressBar pct={pct} />

          <div className="table-wrap mt" style={{ maxHeight: 260, overflowY: 'auto' }}>
            <table className="data">
              <thead>
                <tr><th></th><th>العنوان</th><th>الكمية</th><th>المعاملة</th><th>الحالة</th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td>{stateIcon(states[i])}</td>
                    <td className="mono-cell">{r.addr}</td>
                    <td>{fmt(r.amount)}</td>
                    <td className="mono-cell">{txs[i] || (states[i] === 'running' ? 'جارٍ الإرسال...' : '')}</td>
                    <td>{stateText(states[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row mt" style={{ gap: 8 }}>
            <button type="button" className="btn btn-sm grow" onClick={togglePause}>
              <Icon name={paused ? 'zap' : 'pause'} size={13} /> {paused ? 'استئناف' : 'إيقاف مؤقت'}
            </button>
            <button type="button" className="btn btn-sm grow" onClick={skipCurrent}>
              <Icon name="skip" size={13} /> تخطي الحالي
            </button>
            <button type="button" className="btn btn-sm btn-danger grow" onClick={cancelAll}>
              <Icon name="stop" size={13} /> إلغاء الكل
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="center">
          <div className="big-check success-burst"><Icon name="check" size={40} strokeWidth={3} /></div>
          <h2 className="green mt-sm" style={{ fontSize: 21 }}>
            ✅ {successCount}/{rows.length} ناجحة!
          </h2>
          <p className="muted small mt-sm">إجمالي الوحدات: {fmt(total)} وحدة</p>
          <button type="button" className="btn btn-primary btn-block mt" onClick={onClose}>
            إنهاء
          </button>
        </div>
      )}
    </Modal>
  );
}
