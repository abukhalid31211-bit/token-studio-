import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Modal } from '../../components/ui/Modal';
import { CopyBtn } from '../../components/ui/primitives';
import { NETWORKS, TESTNETS, WALLET } from '../../data/mock';
import type { NetworkId } from '../../data/mock';
import { fmt, randHex } from '../../lib/format';
import type { EngineConfig } from './ContractEngine';

const DEPLOY_PHASES = [
  'بناء المعاملة...',
  'التوقيع بالمفتاح الخاص...',
  'البث على الشبكة...',
  'انتظار التأكيد...',
];

export function DeployStep({
  cfg,
  onBack,
  onDeployed,
  onNext,
}: {
  cfg: EngineConfig;
  onBack: () => void;
  onDeployed: (addr: string) => void;
  onNext: () => void;
}) {
  const [network, setNetwork] = useState<NetworkId>('TRON');
  const [modal, setModal] = useState<'closed' | 'confirm' | 'running' | 'done'>('closed');
  const [phase, setPhase] = useState(0);
  const timers = useRef<number[]>([]);
  const result = useRef({ addr: 'TNew7Fake' + randHex(4) + '...AbCdEf', tx: randHex(6) + '...' + randHex(6) });

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const startDeploy = () => {
    setModal('running');
    setPhase(0);
    DEPLOY_PHASES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setPhase(i + 1), 750 * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(() => {
        setModal('done');
        onDeployed(result.current.addr);
      }, 750 * DEPLOY_PHASES.length + 500),
    );
  };

  return (
    <div className="tab-pane">
      <h3 className="card-title h3">اختر الشبكة</h3>

      {/* بطاقات الشبكات الرئيسية */}
      <div className="networks-scroll">
        {NETWORKS.map((n) => (
          <div key={n.id} className={`net-card ${network === n.id ? 'selected' : ''}`} onClick={() => setNetwork(n.id)}>
            <div className="net-icon" style={{ background: n.color + '22', color: n.color }}>{n.name.slice(0, 2).toUpperCase()}</div>
            <h5>{n.name} ({n.standard})</h5>
            <div className="net-meta">
              <span>{n.speed}</span>
              <span>{n.cost}</span>
            </div>
            <span className="net-status">
              <span className={`dot ${n.status === 'ok' ? 'green' : 'yellow'}`} />
              {n.statusLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="divider-label">شبكات الاختبار</div>
      <div className="networks-scroll">
        {TESTNETS.map((t) => (
          <div key={t.id} className="net-card testnet" style={{ cursor: t.status === 'down' ? 'not-allowed' : 'pointer', opacity: t.status === 'down' ? 0.5 : 1 }}>
            <h5>{t.name}</h5>
            <span className="net-status">
              <span className={`dot ${t.status === 'ok' ? 'green' : 'red'}`} />
              {t.statusLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* محفظة النشر */}
      <h3 className="card-title h3">محفظة النشر</h3>
      <div className="card tight mb">
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="stat-icon green" style={{ width: 40, height: 40 }}><Icon name="wallet" size={18} /></div>
            <span className="mono" style={{ color: 'var(--text)' }}>{WALLET.address.slice(0, 9)}...{WALLET.address.slice(-5)}</span>
            <CopyBtn text={WALLET.address} small />
            <span className="net-status"><span className="dot green" /> متصلة</span>
          </div>
          <span className="bold green">{fmt(WALLET.trx)} TRX (${WALLET.tronUsd.toFixed(2)})</span>
        </div>
      </div>

      {/* التكلفة المقدرة */}
      <h3 className="card-title h3">التكلفة المقدرة</h3>
      <div className="card tight mb">
        <div className="kv"><span className="k">تقدير الغاز:</span><span className="v">~85 TRX</span></div>
        <div className="kv"><span className="k">التكلفة بالدولار:</span><span className="v">$10.20</span></div>
        <div className="kv">
          <span className="k">رصيد المحفظة:</span>
          <span className="v green"><Icon name="check" size={14} strokeWidth={3} /> {fmt(WALLET.trx)} TRX</span>
        </div>
      </div>

      {/* إعدادات المُنشئ */}
      <h3 className="card-title h3">إعدادات المُنشئ (Constructor)</h3>
      <div className="card mb">
        <div className="field">
          <div className="field-label">العرض الأولي</div>
          <input className="input" value={cfg.supply} readOnly />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <div className="field-label">عنوان المالك</div>
          <div className="input-wrap">
            <input className="input locked mono" value={WALLET.address} disabled />
            <span className="input-icons"><span className="lock-icon" data-tip="مأخوذ تلقائياً من المحفظة المتصلة" style={{ width: 32, height: 32 }}><Icon name="lock" size={14} /></span></span>
          </div>
        </div>
      </div>

      <div className="center">
        <button type="button" className="btn btn-primary btn-lg glow" onClick={() => setModal('confirm')}>
          <Icon name="rocket" size={18} /> نشر العقد
        </button>
      </div>

      <div className="row between mt-lg">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
      </div>

      {/* نافذة تأكيد/تنفيذ النشر */}
      <Modal
        open={modal !== 'closed'}
        onClose={() => setModal('closed')}
        locked={modal === 'running'}
        title={
          modal === 'confirm' ? 'تأكيد النشر' : modal === 'running' ? (
            <span className="row" style={{ gap: 9 }}>جارٍ النشر... <span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /></span>
          ) : (
            <span className="row green" style={{ gap: 9 }}><Icon name="check" size={18} strokeWidth={3} /> تم نشر العقد!</span>
          )
        }
      >
        {modal === 'confirm' && (
          <>
            <div className="kv"><span className="k">التوكن:</span><span className="v">{cfg.name || 'Token'} ({cfg.symbol || '—'})</span></div>
            <div className="kv"><span className="k">الشبكة:</span><span className="v">{NETWORKS.find((n) => n.id === network)?.name} الرئيسية</span></div>
            <div className="kv"><span className="k">التكلفة:</span><span className="v">~85 TRX ($10.20)</span></div>
            <div className="modal-sep" />
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={startDeploy}>تأكيد النشر</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setModal('closed')}>إلغاء</button>
          </>
        )}

        {modal === 'running' && (
          <div className="status-lines">
            {DEPLOY_PHASES.map((p, i) => {
              const complete = i < phase;
              const active = i === phase;
              if (!complete && !active) return null;
              return (
                <div className="status-line" key={p}>
                  {complete ? (
                    <span className="ok"><Icon name="check" size={16} strokeWidth={3} /></span>
                  ) : (
                    <span className="pending"><span className="spin" style={{ width: 13, height: 13, borderWidth: 2 }} /></span>
                  )}
                  {p}
                </div>
              );
            })}
          </div>
        )}

        {modal === 'done' && (
          <>
            <div className="card darker" style={{ animation: 'screenIn 0.3s ease both' }}>
              <div className="field-label">عنوان العقد</div>
              <div className="row" style={{ gap: 9 }}>
                <span className="mono green bold" style={{ fontSize: 16 }}>{result.current.addr}</span>
                <CopyBtn text={result.current.addr} small />
              </div>
              <div className="modal-sep" />
              <div className="kv">
                <span className="k">TX Hash:</span>
                <span className="v mono-cell" style={{ gap: 8 }}>
                  {result.current.tx}
                  <CopyBtn text={result.current.tx} small />
                  <button type="button" className="btn-text-blue" style={{ fontSize: 11.5 }}>عرض في المستكشف</button>
                </span>
              </div>
              <div className="kv"><span className="k">الغاز المستخدم:</span><span className="v">78,432</span></div>
              <div className="kv"><span className="k">التكلفة:</span><span className="v">72 TRX ($8.64)</span></div>
              <div className="kv"><span className="k">الوقت:</span><span className="v">3.2 ثانية</span></div>
            </div>
            <div className="row mt" style={{ gap: 9 }}>
              <button type="button" className="btn grow" onClick={() => setModal('closed')}>نشر عقد آخر</button>
              <button type="button" className="btn btn-primary grow" onClick={() => { setModal('closed'); onNext(); }}>
                متابعة للتحقق <Icon name="arrowLeft" size={14} />
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
