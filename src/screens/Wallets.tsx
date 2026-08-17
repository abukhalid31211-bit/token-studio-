import { useState } from 'react';
import { Icon } from '../lib/icons';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Toggle, CopyBtn } from '../components/ui/primitives';
import { WALLET, OTHER_WALLETS } from '../data/mock';
import { useApp } from '../state/AppContext';

interface MiniWallet {
  id: string;
  addr: string;
  badges: string[];
  balance: string;
}

export function WalletsScreen() {
  const { toast } = useApp();
  const [wallets, setWallets] = useState<MiniWallet[]>(OTHER_WALLETS);
  const [mainWallet, setMainWallet] = useState({ addr: WALLET.address, short: WALLET.short });
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MiniWallet | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importTab, setImportTab] = useState<'key' | 'seed'>('key');
  const [pk, setPk] = useState('');
  const [pkVisible, setPkVisible] = useState(false);
  const [pkNet, setPkNet] = useState('TRON');
  const [seed, setSeed] = useState<string[]>(Array(12).fill(''));
  const [seed24, setSeed24] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const makePrimary = (w: MiniWallet) => {
    setWallets((ws) => [
      ...ws.filter((x) => x.id !== w.id),
      { id: 'old-main', addr: mainWallet.short, badges: ['TRC20'], balance: `${WALLET.trx} TRX` },
    ]);
    setMainWallet({ addr: w.addr, short: w.addr });
    toast('success', `تم تعيين ${w.addr} كمحفظة رئيسية ⭐`);
  };

  const doImportKey = () => {
    if (pk.trim().length < 20) {
      toast('error', 'صيغة المفتاح الخاص غير صحيحة');
      return;
    }
    setImportOpen(false);
    setPk('');
    const newAddr = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);
    setWallets((ws) => [...ws, { id: 'w' + Date.now(), addr: newAddr, badges: [pkNet === 'TRON' ? 'TRC20' : pkNet], balance: '0.00' }]);
    toast('success', 'تم استيراد المحفظة بنجاح ✅');
  };

  const doImportSeed = () => {
    const words = seed.slice(0, seed24 ? 24 : 12).map((s) => s.trim());
    if (words.some((w) => !w)) {
      toast('error', 'أكمل جميع كلمات عبارة الاسترداد');
      return;
    }
    setImportOpen(false);
    setSeed(Array(12).fill(''));
    setWallets((ws) => [...ws, { id: 'w' + Date.now(), addr: 'T' + Math.random().toString(36).slice(2, 8) + '...' + Math.random().toString(36).slice(2, 6), badges: ['TRC20'], balance: '0 TRX' }]);
    toast('success', 'تم استيراد المحفظة من عبارة الاسترداد ✅');
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 className="section-title">إدارة المحافظ</h1>

      {/* المحفظة الرئيسية */}
      <div className="wallet-main-card mb-lg">
        <span className="main-badge">رئيسية</span>
        <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
          <div className="stat-icon green" style={{ width: 56, height: 56, margin: '0 auto' }}><Icon name="wallet" size={26} /></div>
        </div>
        <div className="net-status mt-sm" style={{ justifyContent: 'center' }}>
          <span className="dot green pulse" /> متصلة
        </div>
        <div className="wallet-addr-full">{mainWallet.addr}</div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <CopyBtn text={mainWallet.addr} small label="نسخ" />
        </div>

        <div className="balance-chips mt">
          <span className="balance-chip" style={{ background: 'rgba(239,68,68,0.14)', color: '#ff7b7b' }}>1,250 TRX</span>
          <span className="balance-chip" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>9,915,000 وحدة</span>
          <span className="balance-chip" style={{ background: 'var(--warning-soft)', color: '#ffc555' }}>0.45 BNB</span>
          <span className="balance-chip" style={{ background: 'var(--info-soft)', color: '#7cabff' }}>0.02 ETH</span>
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: 18 }}>
          <button type="button" className="btn-text-blue" onClick={() => toast('info', 'فتح المستكشف 🔗')}>عرض في المستكشف</button>
          <button type="button" className="btn-text-red" onClick={() => setDisconnectOpen(true)}>قطع الاتصال</button>
        </div>
      </div>

      <div className="divider" />

      {/* المحافظ الأخرى */}
      <h3 className="card-title h3">المحافظ الأخرى</h3>
      <div className="col mb-lg" style={{ gap: 12 }}>
        {wallets.map((w) => (
          <div key={w.id} className="wallet-mini">
            <div className="stat-icon blue" style={{ width: 40, height: 40 }}><Icon name="wallet" size={17} /></div>
            <div className="wm-info">
              <div className="wm-addr">{w.addr}</div>
              <div className="row mt-sm" style={{ gap: 6 }}>
                {w.badges.map((b) => (
                  <span key={b} className={`badge ${b.toLowerCase()}`}>{b}</span>
                ))}
              </div>
            </div>
            <span className="muted small bold">{w.balance}</span>
            <button type="button" className="btn-text-green" onClick={() => makePrimary(w)}>تعيين رئيسية</button>
            <button type="button" className="btn-text-red" style={{ fontSize: 16 }} onClick={() => setDeleteTarget(w)} aria-label="حذف المحفظة">
              <Icon name="trash" size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* إضافة محفظة */}
      <button
        type="button"
        className="btn btn-block btn-lg"
        style={{ border: '2px dashed var(--primary)', background: 'var(--primary-soft)', color: 'var(--primary)' }}
        onClick={() => setImportOpen(true)}
      >
        <Icon name="plus" size={18} /> إضافة محفظة
      </button>

      <div className="divider" />

      {/* ربط محفظة خارجية */}
      <h4 className="card-title h3">ربط محفظة خارجية</h4>
      <div className="col" style={{ gap: 10 }}>
        <button type="button" className="btn btn-block" style={{ borderColor: '#f6851b', color: '#f6851b', justifyContent: 'flex-start' }}
          onClick={() => toast('info', 'جارٍ طلب الاتصال بـ MetaMask... 🦊')}>
          <Icon name="wallet" size={17} /> ربط MetaMask
        </button>
        <button type="button" className="btn btn-block" style={{ borderColor: '#ef4444', color: '#ff7b7b', justifyContent: 'flex-start' }}
          onClick={() => toast('info', 'جارٍ طلب الاتصال بـ TronLink...')}>
          <Icon name="link" size={17} /> ربط TronLink
        </button>
        <button type="button" className="btn btn-block" style={{ borderColor: '#3b82f6', color: '#7cabff', justifyContent: 'flex-start' }}
          onClick={() => setQrOpen(true)}>
          <Icon name="qr" size={17} /> ربط WalletConnect
        </button>
      </div>

      {/* نافذة قطع الاتصال */}
      <ConfirmModal
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={() => { setDisconnectOpen(false); toast('warning', 'تم قطع اتصال المحفظة'); }}
        title="قطع اتصال المحفظة؟"
        confirmLabel="نعم، قطع الاتصال"
        danger
        body={<p className="muted small">ستفقد القدرة على السك والإرسال حتى إعادة الاتصال.</p>}
      />

      {/* نافذة تأكيد الحذف */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setWallets((ws) => ws.filter((x) => x.id !== deleteTarget?.id));
          setDeleteTarget(null);
          toast('success', 'تم حذف المحفظة 🗑');
        }}
        title="حذف المحفظة؟"
        confirmLabel="نعم، حذف"
        danger
        body={<p className="muted small">سيُزال <b className="mono">{deleteTarget?.addr}</b> من القائمة. تأكد من احتفاظك بالمفتاح الخاص.</p>}
      />

      {/* نافذة استيراد محفظة */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="استيراد محفظة" size="lg">
        <div className="tabs mini">
          <button type="button" className={`tab-btn ${importTab === 'key' ? 'active' : ''}`} onClick={() => setImportTab('key')}>المفتاح الخاص</button>
          <button type="button" className={`tab-btn ${importTab === 'seed' ? 'active' : ''}`} onClick={() => setImportTab('seed')}>عبارة الاسترداد</button>
        </div>

        {importTab === 'key' && (
          <div className="tab-pane mt">
            <div className="field">
              <div className="field-label">المفتاح الخاص</div>
              <div className="input-wrap">
                <input
                  className="input mono"
                  type={pkVisible ? 'text' : 'password'}
                  value={pk}
                  onChange={(e) => setPk(e.target.value)}
                  placeholder="••••••••••••••••"
                />
                <div className="input-icons">
                  <button type="button" onClick={() => setPkVisible((v) => !v)} aria-label="إظهار">
                    <Icon name={pkVisible ? 'eyeOff' : 'eye'} size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="field">
              <div className="field-label">الشبكة:</div>
              <select className="input" value={pkNet} onChange={(e) => setPkNet(e.target.value)}>
                {['TRON', 'Ethereum', 'BSC', 'Polygon', 'Solana'].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={doImportKey}>استيراد</button>
          </div>
        )}

        {importTab === 'seed' && (
          <div className="tab-pane mt">
            <div className="row between mb-sm">
              <span className="small muted">أدخل عبارة الاسترداد المكوّنة من {seed24 ? 24 : 12} كلمة</span>
              <Toggle on={seed24} onChange={(v) => { setSeed24(v); setSeed(Array(v ? 24 : 12).fill('')); }} label="24 كلمة" />
            </div>
            <div className="seed-grid">
              {seed.map((w, i) => (
                <div key={i}>
                  <span className="seed-num">{i + 1}.</span>
                  <input
                    className="seed-input"
                    value={w}
                    onChange={(e) => setSeed((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-block mt" onClick={doImportSeed}>استيراد</button>
          </div>
        )}
      </Modal>

      {/* نافذة QR لربط WalletConnect */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="ربط عبر WalletConnect" size="sm">
        <div className="qr-box" style={{ background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 14px)', gap: 2, direction: 'ltr' }}>
            {Array.from({ length: 81 }, (_, i) => (
              <span key={i} style={{ width: 14, height: 14, background: (i * 7 + Math.floor(i / 9) * 3) % 5 < 2 ? '#111' : '#fff', borderRadius: 2 }} />
            ))}
          </div>
        </div>
        <p className="muted small center mt-sm">امسح الرمز بتطبيق محفظتك للموافقة على الاتصال</p>
      </Modal>
    </div>
  );
}
