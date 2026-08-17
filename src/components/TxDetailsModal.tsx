import { Modal } from './ui/Modal';
import { CopyBtn } from './ui/primitives';
import { Icon } from '../lib/icons';
import { fmt } from '../lib/format';
import { useApp } from '../state/AppContext';
import type { Tx } from '../data/mock';

const TYPE_LABEL: Record<Tx['type'], string> = { mint: 'سك', send: 'إرسال', burn: 'حرق' };
const STATUS_LABEL: Record<Tx['status'], { t: string; c: string }> = {
  success: { t: 'ناجحة', c: 'var(--success)' },
  pending: { t: 'قيد الانتظار', c: 'var(--warning)' },
  failed: { t: 'فاشلة', c: 'var(--error)' },
};

/* نافذة تفاصيل المعاملة — عامة لكل الشاشات */
export function TxDetailsModal({ tx, onClose }: { tx: Tx | null; onClose: () => void }) {
  const { toast } = useApp();

  return (
    <Modal open={!!tx} onClose={onClose} title={<span className="row" style={{ gap: 9 }}><Icon name="file" size={18} className="green" /> تفاصيل المعاملة</span>}>
      {tx && (
        <>
          <div className="kv">
            <span className="k">TX Hash:</span>
            <span className="v mono-cell" style={{ gap: 8 }}>
              {tx.txHash}
              {tx.txHash !== '—' && <CopyBtn text={tx.txHash} small />}
            </span>
          </div>
          <div className="kv">
            <span className="k">النوع:</span>
            <span className="v"><span className={`badge ${tx.type}`}>{TYPE_LABEL[tx.type]}</span></span>
          </div>
          <div className="kv">
            <span className="k">البلوك:</span>
            <span className="v">{tx.block}</span>
          </div>
          <div className="kv">
            <span className="k">الطابع الزمني:</span>
            <span className="v">{tx.date} {tx.time}:07 UTC</span>
          </div>
          <div className="kv">
            <span className="k">الحالة:</span>
            <span className="v">
              <span className="dot" style={{ background: STATUS_LABEL[tx.status].c }} />
              {STATUS_LABEL[tx.status].t}
            </span>
          </div>
          <div className="kv">
            <span className="k">الكمية:</span>
            <span className="v green">{fmt(tx.amount)} وحدة</span>
          </div>
          <div className="kv">
            <span className="k">إلى:</span>
            <span className="v mono-cell" style={{ gap: 8 }}>
              {tx.to}
              {tx.to !== '—' && <CopyBtn text={tx.to} small />}
            </span>
          </div>
          <div className="kv">
            <span className="k">الغاز المستخدم:</span>
            <span className="v">{tx.gas}</span>
          </div>
          <div className="kv">
            <span className="k">الرسوم:</span>
            <span className="v">{tx.fee}</span>
          </div>
          <div className="kv">
            <span className="k">الشبكة:</span>
            <span className="v">{tx.network === '—' ? '—' : `${tx.network} (${tx.netBadge})`}</span>
          </div>
          <div className="kv">
            <span className="k">التأكيدات:</span>
            <span className="v">{fmt(tx.confirmations)}</span>
          </div>
          <div className="kv">
            <span className="k">عنوان العقد:</span>
            <span className="v mono-cell" style={{ gap: 8 }}>
              {tx.contract}
              <CopyBtn text={tx.contract} small />
            </span>
          </div>

          <div className="modal-sep" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم النسخ ✅')}>
              <Icon name="copy" size={13} /> نسخ TX
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('info', 'فتح المستكشف في تبويب جديد 🔗')}>
              <Icon name="external" size={13} /> المستكشف
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم حفظ اللقطة 📸')}>
              <Icon name="camera" size={13} /> لقطة
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم نسخ الملخص 📤')}>
              <Icon name="share" size={13} /> مشاركة
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
