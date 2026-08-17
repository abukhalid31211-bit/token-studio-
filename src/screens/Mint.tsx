import { useEffect, useState } from 'react';
import { Icon } from '../lib/icons';
import { Tabs } from '../components/ui/primitives';
import { Modal } from '../components/ui/Modal';
import { Donut } from '../components/ui/charts';
import { CONTRACTS, HOLDERS, TOKEN_BALANCE, TOTAL_SUPPLY, WALLET, DAILY_LIMIT } from '../data/mock';
import { fmt } from '../lib/format';
import { MintQuick } from './mint/MintQuick';
import { MintBatch } from './mint/MintBatch';
import { MintHistory } from './mint/MintHistory';

/* عدّاد تنازلي حتى إعادة ضبط الحد اليومي */
export function useResetCountdown() {
  const [left, setLeft] = useState(9 * 3600 + 28 * 60);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 9 * 3600)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return `${h}س ${m}د ${s}ث`;
}

export function MintScreen() {
  const [tab, setTab] = useState('quick');
  const [contract, setContract] = useState(CONTRACTS[0]);
  const [pickOpen, setPickOpen] = useState(false);
  const [usedToday, setUsedToday] = useState(125_000);
  const [balance, setBalance] = useState(TOKEN_BALANCE);
  const [mintedToday, setMintedToday] = useState(10_000_000);
  const countdown = useResetCountdown();

  const onMinted = (amount: number) => {
    setBalance((b) => b + amount);
    setMintedToday((m) => m + amount);
    setUsedToday((u) => Math.min(DAILY_LIMIT, u + amount * 0.01));
  };

  return (
    <div>
      {/* شريط حالة العقد */}
      <div className="contract-bar">
        <span className="dot green pulse" />
        متصل بـ: <b>{contract.name} ({contract.symbol})</b>
        <span className="mono">{contract.addr}</span>
        <span className="badge trc20">{contract.network}</span>
        <button type="button" className="btn-text-blue" onClick={() => setPickOpen(true)}>تغيير</button>
      </div>

      <Tabs
        items={[
          { id: 'quick', label: 'سك سريع' },
          { id: 'batch', label: 'سك جماعي' },
          { id: 'history', label: 'سجل السك' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="content-grid">
        <div className="tab-pane" key={tab}>
          {tab === 'quick' && <MintQuick onMinted={onMinted} usedToday={usedToday} />}
          {tab === 'batch' && <MintBatch onMinted={onMinted} />}
          {tab === 'history' && <MintHistory />}
        </div>

        {/* اللوحة الجانبية */}
        <aside className="side-col">
          <div className="card">
            <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> عرض التوكن</h4>
            <div className="center">
              <Donut
                size={158}
                thickness={20}
                segments={HOLDERS.map((h) => ({ label: h.label, value: h.value, color: h.color }))}
                center={<div><div className="tiny faint">إجمالي العرض</div><div className="bold" style={{ fontSize: 13 }}>1.01B</div></div>}
              />
            </div>
            <div className="kv mt-sm"><span className="k">إجمالي العرض:</span><span className="v">{fmt(TOTAL_SUPPLY)} وحدة</span></div>
            <div className="kv"><span className="k">المسكوك اليوم:</span><span className="v green">+{fmt(mintedToday)}</span></div>
            <div className="kv"><span className="k">الحاملون:</span><span className="v red">4</span></div>
          </div>

          <div className="card">
            <h4 className="card-title h4"><Icon name="wallet" size={15} className="green" /> رصيد المحفظة</h4>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(balance)} <span className="small muted">وحدة</span></div>
            <div className="tiny faint mb-sm">رصيد التوكن</div>
            <div className="modal-sep" />
            <div className="kv"><span className="k">الغاز:</span><span className="v green">{fmt(WALLET.trx)} TRX</span></div>
            <div className="kv"><span className="k">الرصيد قبل السك:</span><span className="v">{fmt(balance)} وحدة</span></div>
            <div className="kv"><span className="k">الرصيد بعد الاكتمال:</span><span className="v green">{fmt(balance + 10_000_000)} وحدة</span></div>
          </div>

          <div className="card">
            <h4 className="card-title h4"><Icon name="shield" size={15} className="green" /> حد الترخيص</h4>
            <div className="kv"><span className="k">المُستخدَم اليوم:</span><span className="v">${fmt(Math.round(usedToday))}</span></div>
            <div className="kv"><span className="k">الحد اليومي:</span><span className="v">${fmt(DAILY_LIMIT)}</span></div>
            <div className="progress thin mt-sm"><div className="fill" style={{ width: `${(usedToday / DAILY_LIMIT) * 100}%` }} /></div>
            <div className="tiny faint mt-sm">يُعاد الضبط في: <b className="green">{countdown}</b></div>
          </div>
        </aside>
      </div>

      {/* نافذة اختيار العقد */}
      <Modal open={pickOpen} onClose={() => setPickOpen(false)} title="اختر العقد" size="sm">
        {CONTRACTS.map((c) => (
          <div className="contract-row" key={c.addr}>
            <span className="grow">
              {c.name} — <span className="mono">{c.addr}</span> — <span className="muted">{c.network}</span>
            </span>
            <button
              type="button"
              className={`btn btn-xs ${contract.addr === c.addr ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setContract(c); setPickOpen(false); }}
            >
              {contract.addr === c.addr ? '✓' : 'اختيار'}
            </button>
          </div>
        ))}
      </Modal>
    </div>
  );
}
