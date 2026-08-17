import { useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Toggle } from '../../components/ui/primitives';
import { BatchRunModal } from '../../components/BatchRunModal';
import { fmt, validateAddress } from '../../lib/format';
import { useApp } from '../../state/AppContext';

let batchId = 200;

interface SendRow {
  id: number;
  addr: string;
  amount: number;
  net: string;
  retention: string;
}

const INITIAL: SendRow[] = [
  { id: 1, addr: 'TQx7kR8vPm2nLq4wXz9bCdEfGhIjKlMn', amount: 10_000, net: 'TRON', retention: '100' },
  { id: 2, addr: 'TVm3aK7rXw5pQn8yTz2cDeFgHiJkLmNo', amount: 50_000, net: 'TRON', retention: '100' },
  { id: 3, addr: 'TRk9xY4tZq6mVb3sWn1fGhIjKlMnOpQr', amount: 25_000, net: 'TRON', retention: '200' },
  { id: 4, addr: 'TAbc1Z5uYr7oWa4tXp2iJkLmNoPqRsTu', amount: 100_000, net: 'TRON', retention: '100' },
  { id: 5, addr: 'TXyz7W6vZs8pXb5uYq3jKlMnOpQrStUv', amount: 5_000, net: 'TRON', retention: '30' },
];

export function SendBatch({ onSent }: { onSent: (n: number) => void }) {
  const { toast } = useApp();
  const [rows, setRows] = useState<SendRow[]>(INITIAL);
  const [removing, setRemoving] = useState<number | null>(null);
  const [delay, setDelay] = useState(false);
  const [failMode, setFailMode] = useState('skip');
  const [runOpen, setRunOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const allValid = rows.length > 0 && rows.every((r) => validateAddress(r.addr, r.net === 'TRON' ? 'TRON' : r.net === 'Solana' ? 'Solana' : 'EVM') && r.amount > 0);

  const removeRow = (id: number) => {
    setRemoving(id);
    setTimeout(() => {
      setRows((rs) => rs.filter((r) => r.id !== id));
      setRemoving(null);
    }, 210);
  };

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).filter(Boolean);
      const parsed: SendRow[] = [];
      lines.forEach((line) => {
        const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const amt = Number(parts[1].replace(/[^\d]/g, ''));
          parsed.push({ id: ++batchId, addr: parts[0], amount: Number.isFinite(amt) ? amt : 0, net: parts[2] || 'TRON', retention: parts[3] || '100' });
        }
      });
      if (!parsed.length) {
        toast('error', 'تعذر قراءة الملف — تأكد من صيغة CSV');
        return;
      }
      setRows([]);
      parsed.forEach((row, i) => setTimeout(() => setRows((rs) => [...rs, row]), 50 * (i + 1)));
      toast('success', `تم استيراد ${parsed.length} صفاً 📄`);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="row mb" style={{ gap: 10, flexWrap: 'wrap' }}>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ''; }} />
        <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>
          <Icon name="file" size={14} /> استيراد CSV
        </button>
        <button type="button" className="btn-text-green" onClick={() => setRows((r) => [...r, { id: ++batchId, addr: '', amount: 0, net: 'TRON', retention: '100' }])}>
          + إضافة يدوي
        </button>
      </div>

      <div className="card table-card mb">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>العنوان</th>
                <th style={{ width: 110 }}>الكمية</th>
                <th style={{ width: 100 }}>الشبكة</th>
                <th style={{ width: 100 }}>مدة البقاء</th>
                <th style={{ width: 80 }}>الحالة</th>
                <th style={{ width: 44 }}>حذف</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const ok = validateAddress(r.addr, r.net === 'TRON' ? 'TRON' : r.net === 'Solana' ? 'Solana' : 'EVM');
                return (
                  <tr key={r.id} className={`batch-row-enter ${removing === r.id ? 'batch-row-exit' : ''}`}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="row" style={{ gap: 7 }}>
                        <input
                          className={`batch-input ${r.addr ? (ok ? 'valid' : 'invalid') : ''}`}
                          value={r.addr}
                          placeholder="عنوان المحفظة..."
                          onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, addr: e.target.value } : x)))}
                        />
                        {r.addr && <span className={`valid-mark ${ok ? 'ok' : 'bad'}`}>{ok ? '✓' : '✗'}</span>}
                      </div>
                    </td>
                    <td>
                      <input className="batch-input" value={r.amount || ''} inputMode="numeric" placeholder="0"
                        onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, amount: Number(e.target.value.replace(/[^\d]/g, '')) || 0 } : x)))} />
                    </td>
                    <td>
                      <select className="batch-input" value={r.net} onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, net: e.target.value } : x)))}>
                        {['TRON', 'BSC', 'ETH', 'Polygon'].map((n) => <option key={n}>{n}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="batch-input" value={r.retention} onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, retention: e.target.value } : x)))}>
                        {['30', '100', '200', '365'].map((d) => <option key={d} value={d}>{d} يوم</option>)}
                      </select>
                    </td>
                    <td className="faint small">{ok && r.amount > 0 ? 'جاهز' : 'ناقِص'}</td>
                    <td>
                      <button type="button" className="btn-text-red" onClick={() => removeRow(r.id)} aria-label="حذف">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="btn btn-block"
          style={{ border: '1.5px dashed var(--primary)', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: 0 }}
          onClick={() => setRows((r) => [...r, { id: ++batchId, addr: '', amount: 0, net: 'TRON', retention: '100' }])}
        >
          <Icon name="plus" size={14} /> إضافة صف
        </button>
      </div>

      <div className="card darker mb">
        <div className="row" style={{ flexWrap: 'wrap', gap: 8, fontSize: 13, fontWeight: 700 }}>
          <span>المستلمون: <b className="green">{rows.length}</b></span>
          <span className="faint">•</span>
          <span>الإجمالي: <b className="green">{fmt(total)} وحدة</b></span>
          <span className="faint">•</span>
          <span>الغاز: <b>~{Math.max(5, rows.length * 8)} TRX</b></span>
          <span className="faint">•</span>
          <span>الوقت: <b>~{rows.length * 5} ثانية</b></span>
        </div>
      </div>

      <div className="row" style={{ gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="field grow" style={{ minWidth: 220 }}>
          <div className="field-label">طريقة التنفيذ</div>
          <select className="input">
            <option>متسلسل (أكثر أماناً)</option>
            <option>متوازٍ (أسرع)</option>
            <option>عقد توزيع جماعي (الأرخص)</option>
          </select>
        </div>
        <div className="field grow" style={{ minWidth: 220 }}>
          <div className="field-label">التأخير بين المعاملات:</div>
          <div className="row" style={{ gap: 10 }}>
            <Toggle on={delay} onChange={setDelay} label="تأخير عشوائي" />
            {delay && (
              <select className="input" style={{ maxWidth: 140, animation: 'expandIn 0.2s ease' }}>
                <option>1–10 ثوانٍ</option>
                <option>10–30 ثانية</option>
              </select>
            )}
          </div>
        </div>
        <div className="field grow" style={{ minWidth: 240 }}>
          <div className="field-label">عند الفشل:</div>
          <div className="radio-group horizontal">
            {[
              { id: 'skip', label: 'تخطي ومتابعة' },
              { id: 'stop', label: 'إيقاف الكل' },
              { id: 'retry', label: 'إعادة 3 مرات ثم تخطي' },
            ].map((o) => (
              <label key={o.id} className="radio-opt">
                <input type="radio" checked={failMode === o.id} onChange={() => setFailMode(o.id)} />
                <span className="r-mark" />
                <span className="r-label">{o.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-primary btn-lg btn-block glow mt" disabled={!allValid} onClick={() => setRunOpen(true)}>
        إرسال جماعي <Icon name="zap" size={16} />
      </button>

      <BatchRunModal
        open={runOpen}
        title="تأكيد الإرسال الجماعي"
        rows={rows.map((r) => ({ id: r.id, addr: r.addr.slice(0, 5) + '...' + r.addr.slice(-4), amount: r.amount }))}
        verb="إرسال"
        onDone={(t) => onSent(t)}
        onClose={() => setRunOpen(false)}
      />
    </div>
  );
}
