import { useRef, useState } from 'react';
import { Icon } from '../lib/icons';
import { Drawer } from '../components/ui/Modal';
import { Toggle } from '../components/ui/primitives';
import { NETWORKS, TESTNETS, RPC_ENDPOINTS } from '../data/mock';
import type { NetworkInfo } from '../data/mock';
import { useApp } from '../state/AppContext';

export function NetworkScreen() {
  const { toast } = useApp();
  const [selected, setSelected] = useState<NetworkInfo | null>(null);
  const [defaultNet, setDefaultNet] = useState('TRON');
  const [endpoints, setEndpoints] = useState(RPC_ENDPOINTS);
  const [activeRpc, setActiveRpc] = useState(RPC_ENDPOINTS[0].url);
  const [testingAll, setTestingAll] = useState(false);
  const [customRpc, setCustomRpc] = useState('');
  const [customStatus, setCustomStatus] = useState<'idle' | 'testing' | 'failed'>('idle');
  const [autoFailover, setAutoFailover] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timers = useRef<number[]>([]);

  const openDetails = (n: NetworkInfo) => {
    setSelected(n);
    setEndpoints(RPC_ENDPOINTS);
    setActiveRpc(RPC_ENDPOINTS[0].url);
  };

  const testAll = () => {
    setTestingAll(true);
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setEndpoints((eps) => eps.map((e) => ({ ...e, latency: 0 })));
    endpoints.forEach((e, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setEndpoints((eps) =>
            eps.map((x, j) => (j === i ? { ...x, latency: e.status === 'down' ? 0 : e.latency + Math.floor(Math.random() * 14 - 7) } : x)),
          );
          if (i === endpoints.length - 1) setTestingAll(false);
        }, 600 * (i + 1)),
      );
    });
    toast('info', 'جارٍ اختبار نقاط الاتصال...');
  };

  const addCustom = () => {
    if (!customRpc.startsWith('http')) {
      setCustomStatus('failed');
      return;
    }
    setCustomStatus('testing');
    setTimeout(() => {
      setEndpoints((eps) => [...eps, { url: customRpc.replace(/^https?:\/\//, ''), latency: 38 + Math.floor(Math.random() * 40), status: 'ok' }]);
      setCustomStatus('idle');
      setCustomRpc('');
      toast('success', 'تمت إضافة نقطة الاتصال بنجاح ✅');
    }, 1200);
  };

  return (
    <div>
      <h1 className="section-title">إعداد الشبكة</h1>

      {/* الشبكات الرئيسية */}
      <div className="nets-grid">
        {NETWORKS.map((n) => (
          <div key={n.id} className="net-big" onClick={() => openDetails(n)}>
            {defaultNet === n.id && <span className="default-badge">افتراضية</span>}
            <h4>
              <span className="net-icon" style={{ width: 34, height: 34, background: n.color + '22', color: n.color, margin: 0, fontSize: 12 }}>
                {n.name.slice(0, 2).toUpperCase()}
              </span>
              {n.name} ({n.standard})
            </h4>
            <span className="net-status">
              <span className={`dot ${n.status === 'ok' ? 'green' : 'yellow'}`} /> {n.statusLabel}
            </span>
            <div className="stats-mini">
              <span>البلوك: {n.block}</span>
              <span>وقت البلوك: {n.blockTime}</span>
              <span>المعاملات/ثانية: {n.tps}</span>
            </div>
            <div className="congestion">
              <div className="bar">
                <i style={{ width: n.congestion + '%', background: n.congestion > 60 ? 'var(--error)' : n.congestion > 35 ? 'var(--warning)' : 'var(--success)' }} />
              </div>
              <span>{n.congestion > 60 ? 'مرتفع' : n.congestion > 35 ? 'متوسط' : 'منخفض'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider-label">شبكات الاختبار</div>
      <div className="nets-grid">
        {TESTNETS.map((t) => (
          <div
            key={t.id}
            className="net-big"
            style={{ borderStyle: 'dashed', opacity: t.status === 'down' ? 0.55 : 1, cursor: t.status === 'down' ? 'not-allowed' : 'pointer' }}
            onClick={() => t.status === 'ok' && toast('info', `تم الاتصال بـ ${t.name}`)}
          >
            <h4 style={{ fontSize: 14 }}>{t.name}</h4>
            <span className="net-status">
              <span className={`dot ${t.status === 'ok' ? 'green' : 'red'}`} /> {t.statusLabel}
            </span>
          </div>
        ))}
      </div>

      {/* اللوحة الجانبية — تفاصيل الشبكة */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`${selected?.name ?? ''} — إعداد RPC`}>
        {selected && (
          <>
            <div className="field-label mt">نقاط الاتصال (Endpoints)</div>
            <div className="card dark tight mb">
              {endpoints.map((e) => {
                const testing = testingAll && e.latency === 0 && e.status !== 'down';
                return (
                  <div className="rpc-row" key={e.url}>
                    <input
                      type="radio"
                      name="rpc"
                      checked={activeRpc === e.url}
                      disabled={e.status === 'down'}
                      onChange={() => {
                        setActiveRpc(e.url);
                        toast('success', `تم التحويل إلى ${e.url}`);
                      }}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span className="rpc-url">{e.url}</span>
                    {testing ? (
                      <span className="spin" style={{ width: 13, height: 13, borderWidth: 2 }} />
                    ) : (
                      <span className={`latency ${e.status === 'down' ? 'dead' : e.latency < 60 ? 'fast' : e.latency < 100 ? 'mid' : 'slow'}`}>
                        {e.status === 'down' ? '—' : e.latency ? `${e.latency} مللي ث` : '...'}
                      </span>
                    )}
                    <span className={`dot ${e.status === 'down' ? 'red' : e.status === 'slow' ? 'yellow' : 'green'}`} />
                  </div>
                );
              })}
              <button type="button" className="btn btn-sm btn-block mt-sm" onClick={testAll} disabled={testingAll}>
                <Icon name="refresh" size={13} /> اختبار الكل
              </button>
            </div>

            <div className="field">
              <div className="field-label">+ RPC مخصص</div>
              <div className="field-row">
                <input className="input mono" placeholder="https://..." value={customRpc} onChange={(e) => { setCustomRpc(e.target.value); setCustomStatus('idle'); }} />
                <button type="button" className="btn btn-sm btn-primary" onClick={addCustom}>إضافة →</button>
              </div>
              {customStatus === 'testing' && <div className="field-ok"><span className="spin" style={{ width: 11, height: 11, borderWidth: 2 }} /> جارٍ الاختبار...</div>}
              {customStatus === 'failed' && <div className="field-error"><Icon name="x" size={12} /> فشل الاتصال — أدخل رابطاً يبدأ بـ https://</div>}
            </div>

            <div className="divider" />

            <div className="kv"><span className="k">التحوّل التلقائي عند الفشل</span><Toggle on={autoFailover} onChange={setAutoFailover} /></div>
            <div className="kv">
              <span className="k">تحديث تلقائي لحالة الشبكة</span>
              <Toggle on={autoRefresh} onChange={setAutoRefresh} />
            </div>
            {autoRefresh && (
              <select className="input mt-sm">
                {['كل 10 ثوانٍ', 'كل 30 ثانية', 'كل 60 ثانية', 'كل 5 دقائق'].map((o) => <option key={o}>{o}</option>)}
              </select>
            )}

            <div className="divider" />

            <div className="field-label">معلومات الشبكة</div>
            <div className="kv"><span className="k">الـ Chain ID:</span><span className="v mono-cell">728126428</span></div>
            <div className="kv"><span className="k">رمز العملة:</span><span className="v">TRX</span></div>
            <div className="kv"><span className="k">وحدة الغاز:</span><span className="v">Energy / Bandwidth</span></div>
            <div className="kv">
              <span className="k">المستكشف:</span>
              <a href="https://tronscan.org" target="_blank" rel="noreferrer" className="mono-cell small">tronscan.org</a>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block mt"
              onClick={() => {
                setDefaultNet(selected.id);
                toast('success', 'تم تحديث الشبكة الافتراضية ✅');
              }}
            >
              تعيين كافتراضية
            </button>
            <button type="button" className="btn btn-block mt-sm" onClick={() => setSelected(null)}>إغلاق</button>
          </>
        )}
      </Drawer>
    </div>
  );
}
