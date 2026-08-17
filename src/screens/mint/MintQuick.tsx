import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/primitives';
import { Burst } from '../../components/ui/Confetti';
import { CopyBtn } from '../../components/ui/primitives';
import { WALLET, DAILY_LIMIT } from '../../data/mock';
import { fmt, parseAmount, validateAddress, randHex } from '../../lib/format';
import { useApp } from '../../state/AppContext';

const CHIPS = [
  { label: '1K', v: 1_000 },
  { label: '10K', v: 10_000 },
  { label: '100K', v: 100_000 },
  { label: '1M', v: 1_000_000 },
  { label: '10M', v: 10_000_000 },
  { label: '100M', v: 100_000_000 },
  { label: '1B', v: 1_000_000_000 },
];

const MINT_PHASES = ['بناء معاملة السك...', 'التوقيع...', 'البث...'];

export function MintQuick({ onMinted, usedToday }: { onMinted: (n: number) => void; usedToday: number }) {
  const { toast } = useApp();
  const [amount, setAmount] = useState('');
  const [chip, setChip] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<'mine' | 'other'>('mine');
  const [otherAddr, setOtherAddr] = useState('');
  const [modal, setModal] = useState<'closed' | 'confirm' | 'running' | 'done'>('closed');
  const [phase, setPhase] = useState(0);
  const [confirm, setConfirm] = useState(0);
  const [burst, setBurst] = useState(false);
  const timers = useRef<number[]>([]);
  const result = useRef({ tx: '', block: '', newBalance: '' });

  const n = parseAmount(amount);
  const overLimit = n > DAILY_LIMIT * 100; // الحد اليومي بالوحدات الافتراضية
  const otherValid = recipient === 'mine' || validateAddress(otherAddr, 'TRON');
  const valid = n > 0 && !overLimit && otherValid;
  const usedPct = (usedToday / DAILY_LIMIT) * 100;

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const start = () => {
    setModal('running');
    setPhase(0);
    setConfirm(0);
    MINT_PHASES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setPhase(i + 1), 600 * (i + 1)));
    });
    // عدّاد التأكيدات 1/20 ← 20/20
    for (let c = 1; c <= 20; c++) {
      timers.current.push(window.setTimeout(() => setConfirm(c), 600 * MINT_PHASES.length + c * 90));
    }
    timers.current.push(
      window.setTimeout(() => {
        result.current = {
          tx: randHex(6) + '...' + randHex(6),
          block: '#' + fmt(58_234_920 + Math.floor(Math.random() * 900)),
          newBalance: '',
        };
        setModal('done');
        setBurst(true);
        setTimeout(() => setBurst(false), 800);
        onMinted(n);
      }, 600 * MINT_PHASES.length + 2200),
    );
  };

  const closeDone = (again: boolean) => {
    setModal('closed');
    toast('success', 'اكتمل السك ✅');
    if (again) {
      setAmount('');
      setChip(null);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <div style={{ position: 'relative' }}>
        <Burst run={burst} />

        <h2 className="section-title" style={{ fontSize: 20 }}>سك وحدات</h2>

        {/* الكمية */}
        <div className="field">
          <div className="field-label">الكمية</div>
          <input
            className={`input big ${n > 0 ? (overLimit ? 'invalid' : 'valid') : ''}`}
            value={amount}
            placeholder="0"
            inputMode="numeric"
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d]/g, ''));
              setChip(null);
            }}
          />
          {overLimit && <div className="field-error"><Icon name="warning" size={12} /> تجاوزت الحد اليومي</div>}
        </div>

        {/* الكميات السريعة */}
        <div className="chip-row mb">
          {CHIPS.map((c) => (
            <button key={c.label} type="button" className={`chip ${chip === c.label ? 'active' : ''}`}
              onClick={() => { setChip(c.label); setAmount(String(c.v)); }}>
              {c.label}
            </button>
          ))}
          <button
            type="button"
            className={`chip ${chip === 'custom' ? 'active' : ''}`}
            onClick={() => { setChip('custom'); setAmount(''); }}
          >
            مخصص
          </button>
        </div>

        {/* المستلم */}
        <div className="field">
          <div className="field-label">سك إلى</div>
          <div className="radio-group horizontal">
            <label className="radio-opt">
              <input type="radio" checked={recipient === 'mine'} onChange={() => setRecipient('mine')} />
              <span className="r-mark" />
              <span className="r-label">محفظتي 🔒 <span className="mono small faint">{WALLET.short}</span></span>
            </label>
            <label className="radio-opt">
              <input type="radio" checked={recipient === 'other'} onChange={() => setRecipient('other')} />
              <span className="r-mark" />
              <span className="r-label">عنوان آخر</span>
            </label>
          </div>
          {recipient === 'other' && (
            <div className="input-wrap mt-sm" style={{ animation: 'expandIn 0.22s ease' }}>
              <input
                className={`input mono ${otherAddr ? (validateAddress(otherAddr, 'TRON') ? 'valid' : 'invalid') : ''}`}
                placeholder="أدخل عنوان المستلم..."
                value={otherAddr}
                onChange={(e) => setOtherAddr(e.target.value)}
              />
              {otherAddr && (
                <span className="input-icons">
                  <span className="valid-mark" style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                    {validateAddress(otherAddr, 'TRON') ? <span className="ok">✓</span> : <span className="bad">✗</span>}
                  </span>
                </span>
              )}
            </div>
          )}
          {recipient === 'other' && otherAddr && !validateAddress(otherAddr, 'TRON') && (
            <div className="field-error"><Icon name="x" size={12} /> صيغة عنوان TRON غير صحيحة</div>
          )}
        </div>

        {/* بطاقة الحسابات */}
        <div className="card darker mb">
          <div className="kv"><span className="k">الكمية:</span><span className="v green">{fmt(n)} وحدة</span></div>
          <div className="kv"><span className="k">القيمة الخام:</span><span className="v mono-cell">{fmt(n * 1_000_000)}</span></div>
          <div className="kv"><span className="k">تقدير الغاز:</span><span className="v">~15 TRX ($1.80)</span></div>
          <div className="kv"><span className="k">رسوم البث:</span><span className="v">~3 TRX</span></div>
        </div>

        {/* شريط الحد اليومي */}
        <div className="mb">
          <div className="row between small bold">
            <span>المُستخدَم: <span className="green">${fmt(Math.round(usedToday))}</span></span>
            <span className="faint">الحد: ${fmt(DAILY_LIMIT)}</span>
          </div>
          <div className="mt-sm"><ProgressBar pct={usedPct} /></div>
          <div className="row between tiny faint mt-sm">
            <span>{usedPct.toFixed(1)}%</span>
            <span>يُعاد الضبط في: 9س 28د</span>
          </div>
        </div>

        {/* زر السك */}
        <button type="button" className="btn btn-primary btn-lg btn-block glow" disabled={!valid} onClick={() => setModal('confirm')}>
          ⚒️ سك الآن
        </button>
      </div>

      {/* نافذة التأكيد / التنفيذ */}
      <Modal
        open={modal !== 'closed'}
        onClose={() => setModal('closed')}
        locked={modal === 'running'}
        size="md"
        title={
          modal === 'confirm' ? 'تأكيد السك' : modal === 'running' ? (
            <span className="row" style={{ gap: 9 }}>جارٍ التنفيذ... <span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /></span>
          ) : undefined
        }
      >
        {modal === 'confirm' && (
          <>
            <div className="kv"><span className="k">الكمية:</span><span className="v green">{fmt(n)} وحدة</span></div>
            <div className="kv"><span className="k">إلى:</span><span className="v mono-cell">{recipient === 'mine' ? `${WALLET.short} (محفظتي)` : otherAddr}</span></div>
            <div className="kv"><span className="k">الغاز:</span><span className="v">~15 TRX ($1.80)</span></div>
            <div className="modal-sep" />
            <button type="button" className="btn btn-primary btn-block" onClick={start}>تأكيد</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setModal('closed')}>إلغاء</button>
          </>
        )}

        {modal === 'running' && (
          <div className="status-lines">
            {MINT_PHASES.map((p, i) => {
              const complete = i < phase;
              const active = i === phase;
              if (!complete && !active) return null;
              return (
                <div className="status-line" key={p}>
                  {complete ? <span className="ok"><Icon name="check" size={16} strokeWidth={3} /></span> : <span className="pending"><span className="spin" style={{ width: 13, height: 13, borderWidth: 2 }} /></span>}
                  {p}
                </div>
              );
            })}
            {phase >= MINT_PHASES.length && (
              <div className="status-line">
                <span className="pending"><span className="spin" style={{ width: 13, height: 13, borderWidth: 2 }} /></span>
                التأكيد... <b className="green mono">{confirm}/20</b>
              </div>
            )}
          </div>
        )}

        {modal === 'done' && (
          <div className="center">
            <div className="big-check success-burst"><Icon name="check" size={40} strokeWidth={3} /></div>
            <h2 className="green mt-sm" style={{ fontSize: 20 }}>✅ تم السك: {fmt(n)} وحدة!</h2>

            <div className="card darker mt" style={{ textAlign: 'right', animation: 'screenIn 0.3s ease both' }}>
              <div className="kv">
                <span className="k">TX Hash:</span>
                <span className="v mono-cell" style={{ gap: 8 }}>
                  {result.current.tx}
                  <CopyBtn text={result.current.tx} small />
                  <button type="button" className="btn-text-blue" style={{ fontSize: 11.5 }}>المستكشف</button>
                </span>
              </div>
              <div className="kv"><span className="k">البلوك:</span><span className="v">{result.current.block}</span></div>
              <div className="kv"><span className="k">الغاز المستخدم:</span><span className="v">48,732</span></div>
              <div className="kv"><span className="k">الرصيد الجديد:</span><span className="v green">19,915,000 وحدة</span></div>
            </div>

            <div className="row mt" style={{ gap: 9 }}>
              <button type="button" className="btn grow" onClick={() => closeDone(false)}>إغلاق</button>
              <button type="button" className="btn btn-primary grow" onClick={() => closeDone(true)}>سك مجدداً</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
