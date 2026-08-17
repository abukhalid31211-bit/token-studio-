import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../lib/icons';
import { Tabs, Pagination, Empty } from '../components/ui/primitives';
import { BarsChart } from '../components/ui/charts';
import { TxDetailsModal } from '../components/TxDetailsModal';
import { TRANSACTIONS, CHART_DAILY, CHART_WEEKLY, CHART_MONTHLY } from '../data/mock';
import type { Tx } from '../data/mock';
import { fmt, downloadFile, toCsv } from '../lib/format';
import { useApp } from '../state/AppContext';

const TYPE_LABEL: Record<Tx['type'], string> = { mint: 'سك', send: 'إرسال', burn: 'حرق' };

export function TransactionsScreen() {
  const { toast } = useApp();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [net, setNet] = useState('الكل');
  const [type, setType] = useState('الكل');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [exportOpen, setExportOpen] = useState(false);
  const [chartTab, setChartTab] = useState('daily');
  const [tx, setTx] = useState<Tx | null>(null);
  const expRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (expRef.current && !expRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (tab === 'mint' && t.type !== 'mint') return false;
      if (tab === 'send' && t.type !== 'send') return false;
      if (tab === 'failed' && t.status !== 'failed') return false;
      if (net !== 'الكل' && t.network !== net) return false;
      if (type !== 'الكل' && TYPE_LABEL[t.type] !== type) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (q && !t.txHash.toLowerCase().includes(q.toLowerCase()) && !t.to.toLowerCase().includes(q.toLowerCase()) && !t.from.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tab, net, type, from, to, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  const totalAmount = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

  const doExport = (kind: 'csv' | 'json' | 'pdf') => {
    setExportOpen(false);
    toast('info', 'جارٍ التصدير...');
    setTimeout(() => {
      if (kind === 'csv') {
        downloadFile('transactions.csv', toCsv([
          ['التاريخ', 'الوقت', 'النوع', 'الكمية', 'من', 'إلى', 'الشبكة', 'TX Hash', 'الحالة'],
          ...filtered.map((t) => [t.date, t.time, TYPE_LABEL[t.type], t.amount, t.from, t.to, t.network, t.txHash, t.status]),
        ]), 'text/csv');
      } else if (kind === 'json') {
        downloadFile('transactions.json', JSON.stringify(filtered, null, 2), 'application/json');
      } else {
        toast('info', 'تصدير PDF يستخدم نافذة الطباعة');
        window.print();
        return;
      }
      toast('success', 'اكتمل التصدير ✅');
    }, 700);
  };

  return (
    <div>
      <h1 className="section-title">سجل المعاملات</h1>

      {/* شريط التصفية */}
      <div className="card mb">
        <div className="row between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div style={{ minWidth: 260 }}>
            <Tabs
              mini
              items={[
                { id: 'all', label: 'الكل' },
                { id: 'mint', label: 'السك' },
                { id: 'send', label: 'الإرسال' },
                { id: 'failed', label: 'الفاشلة' },
              ]}
              active={tab}
              onChange={(id) => { setTab(id); setPage(1); }}
            />
          </div>
          <div className="row" style={{ gap: 9, flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ minWidth: 210 }}>
              <input className="input" placeholder="بحث بـ TX Hash أو عنوان..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
              <span className="input-icons"><span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: 'var(--text-3)' }}><Icon name="search" size={14} /></span></span>
            </div>
            <select className="input" style={{ width: 120 }} value={net} onChange={(e) => { setNet(e.target.value); setPage(1); }}>
              {['الكل', 'TRON', 'BSC', 'ETH', 'Polygon', 'Solana'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select className="input" style={{ width: 110 }} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              {['الكل', 'سك', 'إرسال', 'حرق'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <input type="date" className="input" style={{ width: 145 }} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="من" />
            <input type="date" className="input" style={{ width: 145 }} value={to} onChange={(e) => setTo(e.target.value)} aria-label="إلى" />
            <div className="dropdown" ref={expRef}>
              <button type="button" className="btn btn-sm" onClick={() => setExportOpen((v) => !v)}>
                <Icon name="download" size={13} /> تصدير <Icon name="chevDown" size={12} />
              </button>
              {exportOpen && (
                <div className="dropdown-menu small">
                  <button type="button" className="dropdown-item" onClick={() => doExport('csv')}>📥 تصدير CSV</button>
                  <button type="button" className="dropdown-item" onClick={() => doExport('json')}>📥 تصدير JSON</button>
                  <button type="button" className="dropdown-item" onClick={() => doExport('pdf')}>📥 تصدير PDF</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* إحصاءات سريعة */}
      <div className="card darker mb">
        <div className="row" style={{ flexWrap: 'wrap', gap: 10, fontSize: 13.5, fontWeight: 700 }}>
          <span>إجمالي المعاملات: <b style={{ color: '#fff' }}>{fmt(127)}</b></span>
          <span className="faint">•</span>
          <span>الناجحة: <b className="green">{fmt(124)}</b></span>
          <span className="faint">•</span>
          <span>الفاشلة: <b className="red">3</b></span>
          <span className="faint">•</span>
          <span>إجمالي الكمية: <b style={{ color: '#fff' }}>{fmt(totalAmount)} وحدة</b></span>
          <span className="tiny faint">(المعروضة: {filtered.length})</span>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div className="card table-card">
        <div className="table-wrap">
          <table className="data clickable responsive">
            <thead>
              <tr>
                <th>الوقت</th>
                <th>النوع</th>
                <th>الكمية</th>
                <th>من</th>
                <th>إلى</th>
                <th>الشبكة</th>
                <th>TX Hash</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} onClick={() => setTx(t)} data-tip={t.failReason || undefined}>
                  <td data-th="الوقت">{t.date} {t.time}</td>
                  <td data-th="النوع"><span className={`badge ${t.type}`}>{TYPE_LABEL[t.type]}</span></td>
                  <td data-th="الكمية">{fmt(t.amount)} وحدة</td>
                  <td data-th="من" className="mono-cell">{t.from}</td>
                  <td data-th="إلى" className="mono-cell">{t.to}</td>
                  <td data-th="الشبكة">{t.netBadge === '—' ? '—' : <span className={`badge ${t.netBadge.toLowerCase()}`}>{t.netBadge}</span>}</td>
                  <td data-th="TX Hash" className="mono-cell">{t.txHash}</td>
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

      <div className="divider" />

      {/* الرسم البياني التحليلي */}
      <h3 className="card-title h3">الرسم البياني التحليلي</h3>
      <div className="card">
        <Tabs
          mini
          items={[
            { id: 'daily', label: 'يومي' },
            { id: 'weekly', label: 'أسبوعي' },
            { id: 'monthly', label: 'شهري' },
          ]}
          active={chartTab}
          onChange={setChartTab}
        />
        <div className="tab-pane" key={chartTab}>
          <BarsChart data={chartTab === 'daily' ? CHART_DAILY : chartTab === 'weekly' ? CHART_WEEKLY : CHART_MONTHLY} />
        </div>
      </div>

      <TxDetailsModal tx={tx} onClose={() => setTx(null)} />
    </div>
  );
}
