import { useMemo, useState } from 'react';
import { Icon } from '../lib/icons';
import { useApp } from '../state/AppContext';
import { PageHead, KV, StatCard } from '../components/ui/shared';
import { Tabs, CountUp } from '../components/ui/primitives';
import { BarsChart, Donut } from '../components/ui/charts';
import { CHART_DAILY, CHART_WEEKLY, CHART_MONTHLY, TRANSACTIONS, NETWORKS } from '../data/mock';
import { fmt, downloadFile, toCsv } from '../lib/format';
import { MenuButton } from '../components/ui/shared';

/* شاشة تحليلات المعاملات — SCR-HIST-ANALYTICS */
export function TxAnalytics() {
  const { go, toast } = useApp();
  const [range, setRange] = useState('daily');

  const data = range === 'daily' ? CHART_DAILY : range === 'weekly' ? CHART_WEEKLY : CHART_MONTHLY;

  const stats = useMemo(() => {
    const total = TRANSACTIONS.length;
    const ok = TRANSACTIONS.filter((t) => t.status === 'success').length;
    const failed = TRANSACTIONS.filter((t) => t.status === 'failed').length;
    const pending = TRANSACTIONS.filter((t) => t.status === 'pending').length;
    const amount = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const mintTotal = data.reduce((s, d) => s + d.mint, 0);
    const sendTotal = data.reduce((s, d) => s + d.send, 0);
    const failTotal = data.reduce((s, d) => s + d.failed, 0);
    return { total, ok, failed, pending, amount, mintTotal, sendTotal, failTotal, successRate: total ? (ok / total) * 100 : 0 };
  }, [data]);

  const byNetwork = useMemo(() => {
    const map = new Map<string, number>();
    TRANSACTIONS.forEach((t) => map.set(t.network, (map.get(t.network) ?? 0) + 1));
    return [...map.entries()]
      .filter(([k]) => k !== '—')
      .map(([k, v]) => ({ label: k, value: v, color: NETWORKS.find((n) => n.id === k)?.color ?? '#6b7280' }));
  }, []);

  const byType = [
    { label: 'سك', value: TRANSACTIONS.filter((t) => t.type === 'mint').length, color: '#3b82f6' },
    { label: 'إرسال', value: TRANSACTIONS.filter((t) => t.type === 'send').length, color: '#00d09c' },
    { label: 'حرق', value: TRANSACTIONS.filter((t) => t.type === 'burn').length, color: '#fb923c' },
  ];

  const exportData = (kind: 'csv' | 'json') => {
    toast('info', 'جارٍ التصدير...');
    setTimeout(() => {
      if (kind === 'csv') {
        downloadFile('analytics.csv', toCsv([['الفترة', 'السك', 'الإرسال', 'الفاشلة'], ...data.map((d) => [d.label, d.mint, d.send, d.failed])]), 'text/csv');
      } else {
        downloadFile('analytics.json', JSON.stringify(data, null, 2), 'application/json');
      }
      toast('success', 'اكتمل التصدير ✅');
    }, 600);
  };

  return (
    <div>
      <PageHead
        title="تحليلات المعاملات"
        sub="مؤشرات الأداء وتوزيع العمليات عبر الفترات والشبكات"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => go('transactions')}>
              <Icon name="clock" size={14} /> سجل المعاملات
            </button>
            <MenuButton
              label="تصدير"
              icon="download"
              variant="primary"
              items={[
                { id: 'csv', label: 'تصدير CSV', onClick: () => exportData('csv') },
                { id: 'json', label: 'تصدير JSON', onClick: () => exportData('json') },
              ]}
            />
          </>
        }
      />

      <div className="stats-row">
        <StatCard icon="arrows" tone="blue" label="إجمالي المعاملات" value={<CountUp value={stats.total} />} onClick={() => go('transactions')} />
        <StatCard icon="check" tone="green" label="المعاملات الناجحة" value={<CountUp value={stats.ok} />} hint={`${stats.successRate.toFixed(1)}% نسبة النجاح`} />
        <StatCard icon="warning" tone="red" label="المعاملات الفاشلة" value={<CountUp value={stats.failed} />} hint={`${stats.pending} قيد الانتظار`} />
        <StatCard icon="dollar" tone="yellow" label="إجمالي الكميات" value={<CountUp value={stats.amount} />} hint="وحدة" />
      </div>

      <Tabs
        items={[
          { id: 'daily', label: 'يومي' },
          { id: 'weekly', label: 'أسبوعي' },
          { id: 'monthly', label: 'شهري' },
        ]}
        active={range}
        onChange={setRange}
      />

      <div className="content-grid">
        <div className="tab-pane" key={range}>
          <div className="card mb">
            <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> حجم العمليات ({range === 'daily' ? 'آخر 7 أيام' : range === 'weekly' ? 'الأسبوع الحالي' : 'آخر 4 أسابيع'})</h4>
            <BarsChart data={data} />
            <div className="legend" style={{ flexDirection: 'row', gap: 18, flexWrap: 'wrap' }}>
              <span className="legend-item"><span className="swatch" style={{ background: '#3b82f6' }} /> السك: {fmt(stats.mintTotal)}</span>
              <span className="legend-item"><span className="swatch" style={{ background: '#00d09c' }} /> الإرسال: {fmt(stats.sendTotal)}</span>
              <span className="legend-item"><span className="swatch" style={{ background: '#ef4444' }} /> الفاشلة: {stats.failTotal}</span>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h4 className="card-title h4"><Icon name="globe" size={15} className="green" /> التوزيع حسب الشبكة</h4>
              <div className="center">
                <Donut size={168} segments={byNetwork} center={<div><div className="tiny faint">شبكات</div><div className="bold" style={{ fontSize: 16 }}>{byNetwork.length}</div></div>} />
              </div>
              <div className="legend">
                {byNetwork.map((n) => (
                  <div key={n.label} className="legend-item">
                    <span className="swatch" style={{ background: n.color }} />
                    <span className="grow">{n.label}</span>
                    <b>{n.value}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 className="card-title h4"><Icon name="arrows" size={15} className="green" /> التوزيع حسب النوع</h4>
              <div className="center">
                <Donut size={168} segments={byType} center={<div><div className="tiny faint">إجمالي</div><div className="bold" style={{ fontSize: 16 }}>{stats.total}</div></div>} />
              </div>
              <div className="legend">
                {byType.map((n) => (
                  <div key={n.label} className="legend-item">
                    <span className="swatch" style={{ background: n.color }} />
                    <span className="grow">{n.label}</span>
                    <b>{n.value}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> مؤشرات الأداء</h4>
            <KV k="نسبة النجاح" v={`${stats.successRate.toFixed(1)}%`} tone="green" />
            <KV k="متوسط الكمية" v={fmt(Math.round(stats.amount / Math.max(1, stats.total)))} />
            <KV k="أعلى فترة سكًا" v={data.reduce((a, b) => (b.mint > a.mint ? b : a)).label} />
            <KV k="أعلى فترة إرسالًا" v={data.reduce((a, b) => (b.send > a.send ? b : a)).label} />
            <KV k="إجمالي الإخفاقات" v={stats.failTotal} tone="red" />
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="scale" size={15} className="green" /> متوسط الرسوم</h4>
            <KV k="TRON" v="9.8 TRX (~$1.18)" />
            <KV k="BSC" v="0.0004 BNB (~$0.24)" />
            <KV k="Ethereum" v="0.002 ETH (~$6.40)" />
            <KV k="Polygon" v="0.01 MATIC (~$0.01)" />
          </div>

          <button type="button" className="btn btn-outline btn-block" onClick={() => go('transactions')}>
            فتح سجل المعاملات الكامل
          </button>
        </aside>
      </div>
    </div>
  );
}
