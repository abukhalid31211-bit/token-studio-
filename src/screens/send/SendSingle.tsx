import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Modal, Drawer } from '../../components/ui/Modal';
import { ProgressRing, Accordion, Toggle, CopyBtn } from '../../components/ui/primitives';
import { Burst } from '../../components/ui/Confetti';
import { WALLET, ADDRESS_BOOK, NETWORKS } from '../../data/mock';
import type { NetworkId } from '../../data/mock';
import { fmt, parseAmount, validateAddress, addressNetworkHint, copyText, randHex } from '../../lib/format';
import { useApp } from '../../state/AppContext';
import type { Prefill } from '../Send';

const PHASES = [
  { t: 'بناء المعاملة...', until: 25 },
  { t: 'التوقيع بالمفتاح الخاص...', until: 50 },
  { t: 'البث على TRON...', until: 70 },
  { t: 'انتظار تضمين البلوك...', until: 90 },
  { t: 'جارٍ التأكيد...', until: 100 },
];

const AMT_CHIPS = [
  { label: '100', v: 100 },
  { label: '500', v: 500 },
  { label: '1K', v: 1_000 },
  { label: '5K', v: 5_000 },
  { label: '10K', v: 10_000 },
  { label: '50K', v: 50_000 },
  { label: '100K', v: 100_000 },
];

export function SendSingle({
  balance,
  onSent,
  prefill,
}: {
  balance: number;
  onSent: (n: number) => void;
  prefill: Prefill | null;
}) {
  const { toast } = useApp();
  const [addr, setAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [chip, setChip] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkId>('TRON');
  const [retention, setRetention] = useState('100');
  const [gasMode, setGasMode] = useState('auto');
  const [autoLimit, setAutoLimit] = useState(true);
  const [screenshot, setScreenshot] = useState(true);
  const [autoCopy, setAutoCopy] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [walletsOpen, setWalletsOpen] = useState(false);
  const [modal, setModal] = useState<'closed' | 'confirm' | 'running' | 'done'>('closed');
  const [progress, setProgress] = useState(0);
  const [confirmCount, setConfirmCount] = useState(0);
  const [burst, setBurst] = useState(false);
  const timers = useRef<number[]>([]);
  const result = useRef({ tx: '', block: '' });

  /* تعبئة من "إعادة الإرسال" */
  useEffect(() => {
    if (prefill) {
      setAddr(prefill.addr);
      setAmount(prefill.amount);
      setChip(null);
    }
  }, [prefill]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const n = parseAmount(amount);
  const hint = addressNetworkHint(addr);
  const addrValid = validateAddress(addr, network === 'TRON' ? 'TRON' : network === 'SOLANA' ? 'Solana' : 'EVM');
  const mismatch = addr.trim() !== '' && hint !== null && !addrValid;
  const overBalance = n > balance;
  const amountValid = n > 0 && !overBalance;
  const allValid = addrValid && amountValid;

  const start = () => {
    setModal('running');
    setProgress(0);
    setConfirmCount(0);
    /* تحريك الحلقة عبر المراحل */
    const steps: { pct: number; delay: number }[] = [
      { pct: 25, delay: 700 },
      { pct: 50, delay: 1400 },
      { pct: 70, delay: 2100 },
      { pct: 90, delay: 2700 },
    ];
    steps.forEach((s) => timers.current.push(window.setTimeout(() => setProgress(s.pct), s.delay)));
    for (let c = 1; c <= 20; c++) {
      timers.current.push(window.setTimeout(() => setConfirmCount(c), 2800 + c * 100));
    }
    timers.current.push(
      window.setTimeout(() => {
        setProgress(100);
        result.current = { tx: randHex(6) + '...' + randHex(6), block: '#' + fmt(58_234_920 + Math.floor(Math.random() * 900)) };
        setTimeout(() => {
          setModal('done');
          setBurst(true);
          setTimeout(() => setBurst(false), 800);
          onSent(n);
          if (autoCopy) copyText(result.current.tx);
        }, 350);
      }, 4900),
    );
  };

  const reset = () => {
    setModal('closed');
    setAddr('');
    setAmount('');
    setChip(null);
  };

  const phase = PHASES.find((p) => progress < p.until) ?? PHASES[PHASES.length - 1];

  return (
    <div className="card" style={{ maxWidth: 760 }}>
      {/* صف المُرسِل */}
      <div className="card darker mb" style={{ borderRadius: 12 }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="stat-icon green" style={{ width: 38, height: 38 }}><Icon name="wallet" size={17} /></div>
            <span className="mono muted">{WALLET.address.slice(0, 9)}...{WALLET.address.slice(-5)}</span>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <b className="green">{fmt(balance)} وحدة</b>
            <span className="net-status"><span className="dot green" /> متصلة</span>
            <button type="button" className="btn-text-blue" style={{ fontSize: 12 }} onClick={() => setWalletsOpen(true)}>تغيير</button>
          </div>
        </div>
      </div>

      {/* عنوان المستلم */}
      <div className="field">
        <div className="field-label">عنوان المستلم</div>
        <div className="input-wrap">
          <input
            className={`input mono ${addr ? (addrValid ? 'valid' : 'invalid') : ''}`}
            placeholder="أدخل عنوان المحفظة..."
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
          <div className="input-icons">
            <button type="button" data-tip="لصق من الحافظة" onClick={async () => {
              try {
                const t = await navigator.clipboard.readText();
                if (t) setAddr(t.trim());
              } catch {
                toast('warning', 'تعذر الوصول للحافظة');
              }
            }}>
              <Icon name="paste" size={14} />
            </button>
            <button type="button" data-tip="مسح QR" onClick={() => setQrOpen(true)}>
              <Icon name="qr" size={14} />
            </button>
            <button type="button" data-tip="دفتر العناوين" onClick={() => setBookOpen(true)}>
              <Icon name="book" size={14} />
            </button>
          </div>
        </div>
        {addr && addrValid && (
          <div className="field-ok"><Icon name="check" size={12} /> عنوان {network} صالح</div>
        )}
        {addr && !addrValid && (
          <div className="field-error"><Icon name="x" size={12} /> صيغة عنوان غير صحيحة</div>
        )}
        {addrValid && network === 'TRON' && (
          <div className="card darker mt-sm" style={{ animation: 'expandIn 0.25s ease', padding: 13 }}>
            <div className="row" style={{ gap: 14, fontSize: 12.5 }}>
              <span className="muted">نشط منذ 2024</span>
              <span className="muted">المعاملات: <b className="green">347</b></span>
              <span className="muted">يحتفظ بـ USDT: <b className="green">✅</b></span>
            </div>
          </div>
        )}
      </div>

      {/* الكمية */}
      <div className="field">
        <div className="field-label">الكمية</div>
        <div className="input-wrap">
          <input
            className={`input big ${n > 0 ? (overBalance ? 'invalid' : 'valid') : ''}`}
            style={{ paddingInlineEnd: 76 }}
            placeholder="0.000000"
            inputMode="decimal"
            value={amount}
            onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, '')); setChip(null); }}
          />
          <span className="input-suffix">USDT</span>
        </div>
        {overBalance && <div className="field-error"><Icon name="warning" size={12} /> تجاوزت الرصيد المتاح</div>}
      </div>

      <div className="chip-row mb-sm">
        {AMT_CHIPS.map((c) => (
          <button key={c.label} type="button" className={`chip ${chip === c.label ? 'active' : ''}`} onClick={() => { setChip(c.label); setAmount(String(c.v)); }}>
            {c.label}
          </button>
        ))}
        <button type="button" className={`chip ${chip === 'all' ? 'active' : ''}`} onClick={() => { setChip('all'); setAmount(String(balance)); }}>
          الكل
        </button>
      </div>
      <div className="tiny mb" style={{ color: chip === 'all' ? 'var(--success)' : 'var(--text-3)', fontWeight: 700 }}>
        المتاح: {fmt(balance)} وحدة
      </div>

      {/* الشبكة */}
      <div className="field">
        <div className="field-label">الشبكة</div>
        <div className="chip-row">
          {NETWORKS.slice(0, 5).map((nw) => (
            <button
              key={nw.id}
              type="button"
              className={`chip ${network === nw.id ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
              onClick={() => setNetwork(nw.id)}
            >
              <span style={{ width: 8, height: 8, borderRadius: 50, background: nw.color, display: 'inline-block' }} />
              {nw.name}
            </button>
          ))}
        </div>
        {mismatch && (
          <div className="warn-strip mt-sm">
            <Icon name="warning" size={14} /> صيغة العنوان لا تتطابق مع الشبكة المختارة
          </div>
        )}
      </div>

      {/* مدة بقاء التوكن */}
      <div className="field">
        <div className="field-label">مدة بقاء التوكن</div>
        <div className="radio-group horizontal">
          {['30', '100', '200', '365'].map((d) => (
            <label key={d} className="radio-opt">
              <input type="radio" checked={retention === d} onChange={() => setRetention(d)} />
              <span className="r-mark" />
              <span className="r-label">{d === '365' ? '365 يوماً' : `${d} يوماً`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* الإعدادات المتقدمة */}
      <div className="mb">
        <Accordion title="إعدادات متقدمة">
          <div className="field mt-sm">
            <div className="field-label">وضع الغاز</div>
            <div className="radio-group horizontal">
              {[
                { id: 'auto', label: 'تلقائي (موصى به)' },
                { id: 'low', label: 'منخفض (أبطأ)' },
                { id: 'fast', label: 'سريع (أولوية)' },
                { id: 'custom', label: 'مخصص' },
              ].map((o) => (
                <label key={o.id} className="radio-opt">
                  <input type="radio" checked={gasMode === o.id} onChange={() => setGasMode(o.id)} />
                  <span className="r-mark" />
                  <span className="r-label">{o.label}</span>
                </label>
              ))}
            </div>
            {gasMode === 'custom' && (
              <input className="input mt-sm" placeholder="Gwei" style={{ maxWidth: 180, animation: 'expandIn 0.2s ease' }} />
            )}
          </div>
          <div className="field">
            <div className="field-label">حد الغاز</div>
            <div className="field-row">
              <input className="input" value={autoLimit ? '100,000' : ''} placeholder="100,000" disabled={autoLimit} onChange={() => undefined} />
              <Toggle on={autoLimit} onChange={setAutoLimit} label="تلقائي" />
            </div>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <Toggle on={screenshot} onChange={setScreenshot} label="توليد لقطة شاشة بعد الإرسال" />
            <Toggle on={autoCopy} onChange={setAutoCopy} label="نسخ TX تلقائياً للحافظة" />
          </div>
        </Accordion>
      </div>

      {/* بطاقة الملخص */}
      {allValid && (
        <div className="card darker mb" style={{ border: '1.5px dashed var(--primary)', animation: 'screenIn 0.25s ease both' }}>
          <div className="kv"><span className="k">الإرسال:</span><span className="v green">{fmt(n)} وحدة</span></div>
          <div className="kv"><span className="k">إلى:</span><span className="v mono-cell">{addr.slice(0, 7)}...{addr.slice(-4)}</span></div>
          <div className="kv"><span className="k">الشبكة:</span><span className="v">{network} ({NETWORKS.find((x) => x.id === network)?.standard})</span></div>
          <div className="kv"><span className="k">الغاز المقدر:</span><span className="v">~8 TRX ($0.96)</span></div>
          <div className="kv"><span className="k">الوقت المقدر:</span><span className="v">~3 ثوانٍ</span></div>
          <div className="kv"><span className="k">مدة بقاء التوكن:</span><span className="v">{retention} يوم</span></div>
        </div>
      )}

      <button type="button" className="btn btn-primary btn-lg btn-block glow" style={{ fontSize: 17 }} disabled={!allValid} onClick={() => setModal('confirm')}>
        إرسال الآن <Icon name="zap" size={18} />
      </button>

      {/* نافذة ماسح QR */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="مسح رمز QR" size="sm">
        <div className="qr-box">
          <div className="qr-frame" />
        </div>
        <p className="muted small center mt-sm">وجّه الكاميرا نحو رمز عنوان المحفظة</p>
        <button
          type="button"
          className="btn btn-primary btn-block mt"
          onClick={() => {
            setAddr('TQx7kR8vPm2nLq4wXz9bCdEfGhIjKlMn');
            setQrOpen(false);
            toast('success', 'تم المسح بنجاح ✅');
          }}
        >
          محاكاة مسح ناجح
        </button>
      </Modal>

      {/* لوحة دفتر العناوين */}
      <Drawer open={bookOpen} onClose={() => setBookOpen(false)} title="دفتر العناوين">
        <div className="input-wrap mb">
          <input className="input" placeholder="بحث..." />
          <span className="input-icons"><span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: 'var(--text-3)' }}><Icon name="search" size={14} /></span></span>
        </div>
        {ADDRESS_BOOK.map((a) => (
          <div key={a.name} className="ab-row">
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="ab-name">{a.name}</div>
              <div className="ab-addr">{a.short}</div>
            </div>
            <span className={`badge ${a.net.toLowerCase()}`}>{a.net}</span>
            <button type="button" className="btn btn-xs btn-primary" onClick={() => { setAddr(a.addr); setBookOpen(false); }}>
              اختيار →
            </button>
          </div>
        ))}
        <div className="modal-sep" />
        <button type="button" className="btn-text-green btn-block" onClick={() => { toast('success', 'تم حفظ العنوان في الدفتر 📒'); setBookOpen(false); }}>
          + حفظ العنوان الحالي
        </button>
        <button type="button" className="btn btn-ghost btn-block mt-sm" onClick={() => setBookOpen(false)}>
          إغلاق
        </button>
      </Drawer>

      {/* نافذة قائمة المحافظ */}
      <Modal open={walletsOpen} onClose={() => setWalletsOpen(false)} title="اختر المحفظة" size="sm">
        <div className="contract-row">
          <span className="mono grow">{WALLET.short}</span>
          <span className="badge green">رئيسية</span>
          <button type="button" className="btn btn-xs btn-primary" onClick={() => setWalletsOpen(false)}>اختيار</button>
        </div>
        <div className="contract-row">
          <span className="mono grow">0xAbC...3DeF</span>
          <span className="badge erc20">ERC20</span>
          <button type="button" className="btn btn-xs btn-outline" onClick={() => { setWalletsOpen(false); toast('success', 'تم التبديل للمحفظة 0xAbC...3DeF'); }}>اختيار</button>
        </div>
        <div className="contract-row">
          <span className="mono grow">TRk9xY...7wQs</span>
          <span className="badge trc20">TRC20</span>
          <button type="button" className="btn btn-xs btn-outline" onClick={() => { setWalletsOpen(false); toast('success', 'تم التبديل للمحفظة TRk9xY...7wQs'); }}>اختيار</button>
        </div>
      </Modal>

      {/* نافذة تأكيد / تنفيذ الإرسال */}
      <Modal
        open={modal !== 'closed'}
        onClose={() => setModal('closed')}
        locked={modal === 'running'}
        title={
          modal === 'confirm' ? 'تأكيد الإرسال' : modal === 'running' ? undefined : undefined
        }
      >
        {modal === 'confirm' && (
          <>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>الكمية: <span className="green">{fmt(n)} وحدة</span></h3>
            <div className="kv"><span className="k">إلى:</span><span className="v mono-cell">{addr.slice(0, 8)}...{addr.slice(-4)}</span></div>
            <div className="kv"><span className="k">الشبكة:</span><span className="v">{network} ({NETWORKS.find((x) => x.id === network)?.standard})</span></div>
            <div className="kv"><span className="k">الغاز:</span><span className="v">~8 TRX ($0.96)</span></div>
            <div className="kv"><span className="k">مدة بقاء التوكن:</span><span className="v">{retention} يوم</span></div>
            <div className="modal-sep" />
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={start}>✅ تأكيد الإرسال</button>
            <button type="button" className="btn btn-ghost btn-block" onClick={() => setModal('closed')}>إلغاء</button>
          </>
        )}

        {modal === 'running' && (
          <div className="center" style={{ padding: '10px 0', position: 'relative' }}>
            <ProgressRing pct={progress} size={150} stroke={11}>
              <Icon name="send" size={30} className="green" />
            </ProgressRing>
            <h4 className="mt" style={{ fontSize: 15.5 }}>
              {phase.t} {phase.t.startsWith('جارٍ التأكيد') && <span className="green mono">{confirmCount}/20</span>}
            </h4>
          </div>
        )}

        {modal === 'done' && (
          <div className="center" style={{ position: 'relative' }}>
            <Burst run={burst} />
            <div className="big-check success-burst"><Icon name="check" size={40} strokeWidth={3} /></div>
            <h2 className="green mt-sm" style={{ fontSize: 20 }}>تم الإرسال بنجاح! ✅</h2>

            <div className="card darker mt" style={{ textAlign: 'right', animation: 'screenIn 0.3s ease both' }}>
              <div className="kv">
                <span className="k">TX Hash:</span>
                <span className="v mono-cell green" style={{ gap: 8 }}>
                  {result.current.tx}
                  <CopyBtn text={result.current.tx} small />
                </span>
              </div>
              <div className="kv"><span className="k">البلوك:</span><span className="v">{result.current.block}</span></div>
              <div className="kv"><span className="k">التأكيدات:</span><span className="v green">20 ✅</span></div>
              <div className="kv"><span className="k">الغاز:</span><span className="v">7.8 TRX ($0.94)</span></div>
              <div className="kv"><span className="k">الوقت:</span><span className="v">4.2 ثانية</span></div>
              <div className="kv"><span className="k">الطابع الزمني:</span><span className="v">2026-08-16 14:32:07 UTC</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }} className="mt">
              <button type="button" className="btn btn-sm btn-outline" onClick={() => copyText(result.current.tx).then(() => toast('success', 'تم النسخ ✅'))}>
                <Icon name="copy" size={12} /> نسخ TX
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('info', 'فتح المستكشف 🔗')}>
                <Icon name="external" size={12} /> المستكشف
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => screenshot ? toast('success', 'تم حفظ اللقطة 📸') : toast('warning', 'اللقطات معطلة من الإعدادات')}>
                <Icon name="camera" size={12} /> لقطة
              </button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم نسخ الملخص 📤')}>
                <Icon name="share" size={12} /> مشاركة
              </button>
            </div>

            <div className="row mt" style={{ gap: 9 }}>
              <button type="button" className="btn btn-primary grow" onClick={reset}>إرسال آخر <Icon name="zap" size={13} /></button>
              <button type="button" className="btn grow" onClick={() => setModal('closed')}>✕ إغلاق</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
