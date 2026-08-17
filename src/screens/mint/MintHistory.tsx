import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Tabs, Pagination, Empty } from '../../components/ui/primitives';
import { TxDetailsModal } from '../../components/TxDetailsModal';
import { TRANSACTIONS } from '../../data/mock';
import type { Tx } from '../../data/mock';
import { fmt, downloadFile, toCsv } from '../../lib/format';
import { useApp } from '../../state/AppContext';

export function MintHistory() {
  const { toast } = useApp();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [net, setNet] = useState('الكل');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [exportOpen, setExportOpen] = useState(false);
  const [tx, setTx] = useState<Tx | null>(null);
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (expRef.current && !expRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const mints = useMemo(() => TRANSACTIONS.filter((t) => t.type === 'mint'), []);

  const filtered = useMemo(() => {
    return mints.filter((t) => {
      if (status === 'success' && t.status !== 'success') return false;
      if (status === 'failed' && t.status !== 'failed') return false;
      if (net !== 'الكل' && t.network !== net) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (q && !t.txHash.toLowerCase().includes(q.toLowerCase()) && !t.to.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [mints, status, net, from, to, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  const doExport = (kind: 'csv' | 'json') => {
    setExportOpen(false);
    toast('info', 'جارٍ التصدير...');
    setTimeout(() => {
      if (kind === 'csv') {
        downloadFile(
          'mint-history.csv',
          toCsv([['التاريخ', 'الوقت', 'الكمية', 'إلى', 'TX Hash', 'الغاز', 'الحالة'], ...filtered.map((t) => [t.date, t.time, t.amount, t.to, t.txHash, t.gas, t.status])]),
          'text/csv',
        );
      } else {
        downloadFile('mint-history.json', JSON.stringify(filtered, null, 2), 'application/json');
      }
      toast('success', 'اكتمل التصدير ✅');
    }, 700);
  };

  return (
    <div>
      {/* شريط التصفية */}
      <div className="card mb">
        <div className="row between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div style={{ minWidth: 220 }}>
            <Tabs mini items={[{ id: 'all', label: 'الكل' }, { id: 'success', label: 'ناجحة' }, { id: 'failed', label: 'فاشلة' }]} active={status} onChange={(id) => { setStatus(id); setPage(1); }} />
          </div>
          <div className="row" style={{ gap: 9, flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ minWidth: 220 }}>
              <input className="input" placeholder="بحث بـ TX Hash أو عنوان..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
              <span className="input-icons"><span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: 'var(--text-3)' }}><Icon name="search" size={14} /></span></span>
            </div>
            <select className="input" style={{ width: 130 }} value={net} onChange={(e) => { setNet(e.target.value); setPage(1); }}>
              {['الكل', 'TRON', 'BSC', 'ETH', 'Polygon'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <input type="date" className="input" style={{ width: 150 }} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="من" />
            <input type="date" className="input" style={{ width: 150 }} value={to} onChange={(e) => setTo(e.target.value)} aria-label="إلى" />
            <div className="dropdown" ref={expRef}>
              <button type="button" className="btn btn-sm" onClick={() => setExportOpen((v) => !v)}>
                <Icon name="download" size={13} /> تصدير <Icon name="chevDown" size={12} />
              </button>
              {exportOpen && (
                <div className="dropdown-menu small">
                  <button type="button" className="dropdown-item" onClick={() => doExport('csv')}>📥 تصدير CSV</button>
                  <button type="button" className="dropdown-item" onClick={() => doExport('json')}>📥 تصدير JSON</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الجدول */}
      <div className="card table-card">
        <div className="table-wrap">
          <table className="data clickable responsive">
            <thead>
              <tr>
                <th>التاريخ/الوقت</th>
                <th>الكمية</th>
                <th>إلى</th>
                <th>TX Hash</th>
                <th>الغاز</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} onClick={() => setTx(t)} data-tip={t.failReason || undefined}>
                  <td data-th="التاريخ">{t.date} {t.time}</td>
                  <td data-th="الكمية">{fmt(t.amount)} وحدة</td>
                  <td data-th="إلى" className="mono-cell">{t.to}</td>
                  <td data-th="TX Hash" className="mono-cell">{t.txHash}</td>
                  <td data-th="الغاز">{t.gas}</td>
                  <td data-th="الحالة">
                    <span className={`dot ${t.status === 'success' ? 'green' : t.status === 'pending' ? 'yellow' : 'red'}`} />
                  </td>
                  <td><span className="row-arrow"><Icon name="arrowLeft" size={15} /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty text="لا توجد نتائج مطابقة للتصفية" />}
        </div>
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} perPage={perPage} onPerPage={(n) => { setPerPage(n); setPage(1); }} />

      <TxDetailsModal tx={tx} onClose={() => setTx(null)} />
    </div>
  );
}
