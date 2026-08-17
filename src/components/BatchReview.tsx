import { useState } from 'react';
import { Icon } from '../lib/icons';
import { fmt } from '../lib/format';
import { useApp } from '../state/AppContext';
import { Breadcrumb, StatCard } from './ui/shared';
import { ConfirmModal } from './ui/Modal';
import { DAILY_LIMIT, USED_TODAY } from '../data/mock';

export interface ReviewRow {
  id: number;
  addr: string;
  amount: number;
  net?: string;
}

/* ============================================================
   شاشة مراجعة التنفيذ الجماعي (خطوة)
   SCR-MINT-BATCH-REVIEW · SCR-SEND-BATCH-REVIEW
   ============================================================ */
export function BatchReview({
  kind,
  rows,
  execMode,
  failMode,
  onBack,
  onCancel,
  onConfirm,
}: {
  kind: 'mint' | 'send';
  rows: ReviewRow[];
  /** طريقة التنفيذ المختارة: متتابع / مع تأخير */
  execMode: string;
  /** سلوك الفشل المختار: تخطي / إيقاف */
  failMode: string;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { online, toast } = useApp();
  const [highlight, setHighlight] = useState<number | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const label = kind === 'mint' ? 'السك' : 'الإرسال';
  const section = kind === 'mint' ? 'وحدة السك' : 'وحدة الإرسال';

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const feePerRow = kind === 'mint' ? 12 : 9.8;
  const fees = rows.length * feePerRow;
  const remaining = DAILY_LIMIT - USED_TODAY;
  const afterUsed = USED_TODAY + total;
  const pctOfLimit = (afterUsed / DAILY_LIMIT) * 100;
  const overLimit = afterUsed > DAILY_LIMIT;

  return (
    <div>
      <Breadcrumb items={[{ label: section }, { label: `مراجعة ${label} الجماعي` }]} />

      <div className="page-head">
        <div>
          <h2>مراجعة {label} الجماعي</h2>
          <p className="page-sub">راجع الصفوف والملخص قبل بدء التنفيذ — لا يمكن التراجع بعد بث المعاملات.</p>
        </div>
      </div>

      {/* منطقة الملخص */}
      <div className="stats-row">
        <StatCard icon="users" tone="blue" label="عدد المستلمين" value={fmt(rows.length)} />
        <StatCard icon="hammer" tone="green" label="إجمالي الكميات" value={fmt(total)} hint="وحدة" />
        <StatCard icon="zap" tone="yellow" label="تقدير الرسوم الكلية" value={`~${fees.toFixed(1)} TRX`} hint={`~$${(fees * 0.12).toFixed(2)}`} />
        <StatCard
          icon="scale"
          tone={overLimit ? 'red' : 'green'}
          label="الأثر على الحد اليومي"
          value={`${Math.min(999, pctOfLimit).toFixed(0)}%`}
          hint={overLimit ? `تجاوز بمقدار ${fmt(afterUsed - DAILY_LIMIT)}` : `المتبقي بعد التنفيذ: ${fmt(remaining - total)}`}
        />
      </div>

      {overLimit && (
        <div className="error-strip mb">
          <Icon name="warning" size={15} /> هذه العملية تتجاوز الحد اليومي المسموح ({fmt(DAILY_LIMIT)} وحدة). قلّل الكميات أو ارفع الحد من الإعدادات.
        </div>
      )}

      {/* مؤشرات الخيارات المختارة */}
      <div className="chip-row mb">
        <span className="chip"><Icon name="arrows" size={13} /> طريقة التنفيذ: {execMode}</span>
        <span className="chip"><Icon name="warning" size={13} /> سلوك الفشل: {failMode}</span>
        {!online && <span className="chip" style={{ color: 'var(--error)', borderColor: 'rgba(239,68,68,0.35)' }}><Icon name="globe" size={13} /> غير متصل</span>}
      </div>

      {/* منطقة الجدول */}
      <div className="card table-card mb">
        <div className="table-wrap" style={{ maxHeight: 380, overflowY: 'auto' }}>
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 54 }}>#</th>
                <th>عنوان المستلم</th>
                <th>كمية {label}</th>
                {rows.some((r) => r.net) && <th>الشبكة</th>}
                <th>حالة التحقق</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={highlight === r.id ? 'selected' : ''}
                  onClick={() => setHighlight(highlight === r.id ? null : r.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="mono-cell">{i + 1}</td>
                  <td className="mono-cell">{r.addr}</td>
                  <td><b>{fmt(r.amount)}</b></td>
                  {rows.some((x) => x.net) && <td><span className="badge">{r.net ?? '—'}</span></td>}
                  <td><span className="green bold"><Icon name="check" size={13} strokeWidth={3} /> جاهز</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* منطقة الأزرار السفلية */}
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-primary btn-lg grow glow"
          disabled={!online || overLimit || rows.length === 0}
          onClick={() => {
            if (!online) return toast('error', 'لا يوجد اتصال — تعذّر بدء التنفيذ');
            onConfirm();
          }}
        >
          <Icon name="rocket" size={17} /> بدء {label} الجماعي ({rows.length})
        </button>
        <button type="button" className="btn btn-lg btn-outline" onClick={onBack}>
          <Icon name="arrowRight" size={16} /> العودة لتحرير المستلمين
        </button>
        <button type="button" className="btn btn-lg btn-danger" onClick={() => setCancelOpen(true)}>
          إلغاء العملية
        </button>
      </div>

      {!online && (
        <div className="warn-strip mt">
          <Icon name="globe" size={15} /> زر البدء معطّل حتى استعادة الاتصال بالشبكة.
        </div>
      )}

      {/* MOD-BATCH-CANCEL */}
      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => { setCancelOpen(false); toast('warning', `تم إلغاء عملية ${label} الجماعي`); onCancel(); }}
        title="إلغاء العملية الجماعية؟"
        confirmLabel="نعم، إلغاء"
        danger
        body={<p className="muted small">سيتم إلغاء المراجعة والعودة لتحرير المستلمين. لن تُبثّ أي معاملة.</p>}
      />
    </div>
  );
}
