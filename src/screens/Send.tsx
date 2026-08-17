import { useEffect, useState } from 'react';
import { Icon } from '../lib/icons';
import { Tabs } from '../components/ui/primitives';
import { WALLET, TOKEN_BALANCE, LAST_RECIPIENTS } from '../data/mock';
import { fmt } from '../lib/format';
import { SendSingle } from './send/SendSingle';
import { SendBatch } from './send/SendBatch';

export interface Prefill {
  addr: string;
  amount: string;
  ts: number;
}

export function SendScreen() {
  const [tab, setTab] = useState('single');
  const [balance, setBalance] = useState(TOKEN_BALANCE);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [block, setBlock] = useState(58_235_441);

  /* محاكاة تقدّم البلوكات مباشرةً */
  useEffect(() => {
    const t = setInterval(() => setBlock((b) => b + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const onSent = (amount: number) => setBalance((b) => Math.max(0, b - amount));

  return (
    <div>
      <Tabs
        items={[
          { id: 'single', label: 'إرسال منفرد' },
          { id: 'batch', label: 'إرسال جماعي' },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="content-grid">
        <div className="tab-pane" key={tab}>
          {tab === 'single' ? (
            <SendSingle balance={balance} onSent={onSent} prefill={prefill} />
          ) : (
            <SendBatch onSent={onSent} />
          )}
        </div>

        {/* اللوحة الجانبية */}
        <aside className="side-col">
          <div className="card">
            <h4 className="card-title h4"><Icon name="wallet" size={15} className="green" /> رصيد المحفظة</h4>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(balance)} <span className="small muted">وحدة</span></div>
            <div className="tiny faint">رصيد التوكن</div>
            <div className="modal-sep" />
            <div className="kv"><span className="k">TRX:</span><span className="v green">{fmt(WALLET.trx)}</span></div>
            <div className="kv"><span className="k">BNB:</span><span className="v green">0.45</span></div>
            <div className="kv"><span className="k">ETH:</span><span className="v green">0.02</span></div>
          </div>

          <div className="card">
            <h4 className="card-title h4"><Icon name="globe" size={15} className="green" /> حالة الشبكة</h4>
            <div className="row mb-sm" style={{ gap: 8 }}>
              <span className="dot green pulse" />
              <b>TRON الرئيسية</b>
            </div>
            <div className="kv"><span className="k">البلوك:</span><span className="v mono-cell">#{fmt(block)}</span></div>
            <div className="kv"><span className="k">المعاملات/ثانية:</span><span className="v">1,847</span></div>
            <div className="kv"><span className="k">الازدحام:</span><span className="v green">منخفض</span></div>
            <div className="congestion mt-sm">
              <div className="bar"><i style={{ width: '18%', background: 'var(--success)' }} /></div>
            </div>
          </div>

          <div className="card">
            <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> إرسال سريع</h4>
            {LAST_RECIPIENTS.map((r) => (
              <div key={r.addr} className="ab-row">
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="mono small" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.addr}</div>
                  <div className="tiny faint">آخر مبلغ: {fmt(r.amount)} وحدة</div>
                </div>
                <button
                  type="button"
                  className="btn-text-green"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    setTab('single');
                    setPrefill({ addr: r.full, amount: String(r.amount), ts: Date.now() });
                  }}
                >
                  ↗ إعادة الإرسال
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
