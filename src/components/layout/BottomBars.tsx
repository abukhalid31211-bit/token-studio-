import { useEffect, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { ProgressBar } from '../ui/primitives';
import { ConfirmModal } from '../ui/Modal';

/* ============================================================
   الأشرطة السفلية الثابتة:
   BAR-OFFLINE · BAR-SESSION-WARN · BAR-BATCH-RUNNING
   ============================================================ */
export function BottomBars() {
  const { online, setOnline, sessionWarn, setSessionWarn, batchRunning, setBatchRunning, toast, go } = useApp();
  const [retrying, setRetrying] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [secs, setSecs] = useState(120);

  /* عدّاد تحذير انتهاء الجلسة */
  useEffect(() => {
    if (!sessionWarn) { setSecs(120); return; }
    const t = window.setInterval(() => {
      setSecs((v) => {
        if (v <= 1) { setSessionWarn(false); go('session-expired'); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [sessionWarn, setSessionWarn, go]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <>
      <div className="bottom-bars">
        {/* BAR-OFFLINE */}
        {!online && (
          <div className="bar bar-offline" role="status">
            <Icon name="globe" size={16} />
            <span className="grow">لا يوجد اتصال بالإنترنت — البيانات المعروضة قد تكون قديمة</span>
            <button
              type="button"
              className="btn btn-xs btn-outline"
              disabled={retrying}
              onClick={() => {
                setRetrying(true);
                setTimeout(() => { setRetrying(false); setOnline(true); toast('success', 'تمت استعادة الاتصال ✅'); }, 1200);
              }}
            >
              {retrying ? <><span className="spin" /> إعادة المحاولة...</> : <><Icon name="refresh" size={12} /> إعادة المحاولة</>}
            </button>
          </div>
        )}

        {/* BAR-SESSION-WARN */}
        {sessionWarn && (
          <div className="bar bar-warn" role="alert">
            <Icon name="clock" size={16} />
            <span className="grow">ستنتهي الجلسة خلال <b className="mono-cell">{mm}:{ss}</b> بسبب عدم النشاط</span>
            <button type="button" className="btn btn-xs btn-primary" onClick={() => { setSessionWarn(false); toast('success', 'تم تمديد الجلسة ✅'); }}>
              تمديد الجلسة
            </button>
            <button type="button" className="btn btn-xs btn-ghost" onClick={() => { setSessionWarn(false); go('session-expired'); }}>
              خروج الآن
            </button>
          </div>
        )}

        {/* BAR-BATCH-RUNNING */}
        {batchRunning && (
          <div className="bar bar-batch" role="status">
            <span className="spin" />
            <div className="grow batch-info">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>{batchRunning.label}</span>
                <b className="mono-cell">{batchRunning.done}/{batchRunning.total}</b>
              </div>
              <ProgressBar pct={(batchRunning.done / Math.max(1, batchRunning.total)) * 100} thin />
            </div>
            <button type="button" className="btn btn-xs btn-outline" onClick={() => window.dispatchEvent(new CustomEvent('ts:batch-restore'))}>عرض التفاصيل</button>
            <button type="button" className="btn btn-xs btn-danger" onClick={() => setCancelOpen(true)}>إيقاف</button>
          </div>
        )}
      </div>

      {/* MOD-BATCH-CANCEL */}
      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          setCancelOpen(false);
          const done = batchRunning?.done ?? 0;
          setBatchRunning(null);
          toast('warning', `تم إيقاف العملية — اكتمل ${done} عنصرًا قبل الإيقاف`);
        }}
        title="إيقاف العملية الجماعية؟"
        confirmLabel="نعم، إيقاف"
        danger
        body={
          <p className="muted small">
            العناصر المكتملة ({batchRunning?.done ?? 0}) لن تُلغى — سيتوقف تنفيذ العناصر المتبقية فقط.
          </p>
        }
      />
    </>
  );
}
