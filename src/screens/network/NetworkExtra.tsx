import { useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, Field, KV, EmptyState, SkeletonCards } from '../../components/ui/shared';
import { Toggle } from '../../components/ui/primitives';
import { ConfirmModal } from '../../components/ui/Modal';
import { TESTNETS } from '../../data/mock';

/* ============================================================
   شاشة شبكات الاختبار — SCR-NET-TEST
   ============================================================ */
export function TestnetsScreen() {
  const { go, toast, defaultNetwork, setDefaultNetwork } = useApp();
  const [loading, setLoading] = useState(false);
  const [nets] = useState(TESTNETS);

  const extra: Record<string, { chainId: string; symbol: string; faucet: string; block: string }> = {
    NILE: { chainId: '3448148188', symbol: 'TRX', faucet: 'nileex.io/join/getJoinPage', block: '#48,201,332' },
    BSC_TEST: { chainId: '97', symbol: 'tBNB', faucet: 'testnet.bnbchain.org/faucet-smart', block: '#41,902,556' },
    SEPOLIA: { chainId: '11155111', symbol: 'SepoliaETH', faucet: 'sepoliafaucet.com', block: '—' },
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'اختيار الشبكة', to: 'network' }, { label: 'شبكات الاختبار' }]} />
      <PageHead
        title="شبكات الاختبار"
        sub="جرّب النشر والسك قبل التشغيل الفعلي دون تكلفة"
        backTo="network"
        actions={
          <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث حالة شبكات الاختبار'); }, 700); }}>
            <Icon name="refresh" size={14} /> تحديث الحالة
          </button>
        }
      />

      <div className="warn-strip mb">
        <Icon name="warning" size={15} /> التوكنات على شبكات الاختبار بلا قيمة حقيقية — للتجربة فقط.
      </div>

      {loading ? (
        <SkeletonCards count={3} height={150} />
      ) : (
        <div className="nets-grid">
          {nets.map((n) => {
            const ex = extra[n.id];
            const isDefault = defaultNetwork === n.id;
            return (
              <div key={n.id} className={`net-big testnet-card ${n.status === 'down' ? 'is-down' : ''}`}>
                {isDefault && <span className="default-badge">افتراضية</span>}
                <h4>
                  <span className={`dot ${n.status === 'ok' ? 'green pulse' : 'red'}`} />
                  {n.name}
                </h4>
                <div className="stats-mini">
                  <span>الحالة: <b className={n.status === 'ok' ? 'green' : 'red'}>{n.statusLabel}</b></span>
                  <span>معرف السلسلة: <b className="mono-cell">{ex?.chainId}</b></span>
                  <span>عملة الرسوم: <b>{ex?.symbol}</b></span>
                  <span>البلوك الحالي: <b className="mono-cell">{ex?.block}</b></span>
                </div>
                <div className="row mt-sm" style={{ gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${isDefault ? 'btn-primary' : 'btn-outline'} grow`}
                    disabled={n.status === 'down'}
                    onClick={() => { setDefaultNetwork(n.id); toast('success', `تم تعيين ${n.name} كشبكة افتراضية ✅`); }}
                  >
                    {isDefault ? '✓ افتراضية' : 'تعيين افتراضية'}
                  </button>
                  <button type="button" className="btn btn-xs btn-ghost" onClick={() => toast('info', `صنبور الاختبار: ${ex?.faucet}`)}>
                    <Icon name="external" size={12} /> الصنبور
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="row mt-lg" style={{ gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={() => go('network')}>
          <Icon name="arrowRight" size={15} /> العودة لشبكات التشغيل
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go('network-custom')}>
          <Icon name="plus" size={15} strokeWidth={3} /> إضافة شبكة مخصصة
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   شاشة إضافة شبكة مخصصة — SCR-NET-CUSTOM
   ============================================================ */
export function CustomNetworkScreen() {
  const { go, toast, setDefaultNetwork } = useApp();
  const [name, setName] = useState('');
  const [rpc, setRpc] = useState('');
  const [chainId, setChainId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [explorer, setExplorer] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latency?: number; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [discard, setDiscard] = useState(false);

  const dirty = !!(name || rpc || chainId || symbol || explorer);
  const errName = !name.trim() ? 'اسم الشبكة مطلوب' : null;
  const errRpc = !rpc.trim() ? 'عنوان نقطة الاتصال مطلوب' : !/^https?:\/\//.test(rpc) ? 'يجب أن يبدأ العنوان بـ http أو https' : null;
  const errChain = !chainId.trim() ? 'معرف السلسلة مطلوب' : !/^\d+$/.test(chainId) ? 'معرف السلسلة يجب أن يكون رقمًا' : null;
  const errSymbol = !symbol.trim() ? 'رمز عملة الرسوم مطلوب' : null;

  const testRpc = () => {
    if (errRpc) { setTestResult({ ok: false, msg: errRpc }); return; }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      const ok = !rpc.includes('invalid');
      setTestResult(ok ? { ok: true, latency: 40 + Math.floor(Math.random() * 90), msg: 'نقطة الاتصال تعمل' } : { ok: false, msg: 'تعذر الاتصال بنقطة الاتصال (timeout)' });
      toast(ok ? 'success' : 'error', ok ? 'نقطة الاتصال تعمل ✅' : 'تعذر الاتصال بنقطة الاتصال');
    }, 1300);
  };

  const save = () => {
    if (errName || errRpc || errChain || errSymbol) return toast('error', 'أكمل الحقول المطلوبة');
    if (!testResult?.ok) return toast('warning', 'اختبر نقطة الاتصال قبل الحفظ');
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (makeDefault) setDefaultNetwork(name.toUpperCase());
      toast('success', `تمت إضافة شبكة ${name} ✅`);
      go('network');
    }, 800);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'اختيار الشبكة', to: 'network' }, { label: 'إضافة شبكة مخصصة' }]} />
      <PageHead title="إضافة شبكة مخصصة" sub="أضف شبكة متوافقة عبر نقطة اتصال خاصة" backTo="network" />

      <div className="content-grid">
        <div className="card">
          <Field label="اسم الشبكة" required error={name !== '' && errName ? errName : null}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: Avalanche C-Chain" />
          </Field>

          <Field label="عنوان نقطة الاتصال (RPC)" required error={rpc !== '' && errRpc ? errRpc : null}>
            <div className="input-wrap">
              <input className={`input mono ${rpc && errRpc ? 'invalid' : testResult?.ok ? 'valid' : ''}`} value={rpc} onChange={(e) => { setRpc(e.target.value); setTestResult(null); }} placeholder="https://rpc.example.com" dir="ltr" />
            </div>
          </Field>

          <div className="grid-2">
            <Field label="معرف السلسلة (Chain ID)" required error={chainId !== '' && errChain ? errChain : null}>
              <input className="input mono" value={chainId} onChange={(e) => setChainId(e.target.value)} placeholder="43114" dir="ltr" />
            </Field>
            <Field label="رمز عملة الرسوم" required error={symbol !== '' && errSymbol ? errSymbol : null}>
              <input className="input mono" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AVAX" dir="ltr" maxLength={8} />
            </Field>
          </div>

          <Field label="عنوان المستكشف الخارجي" hint="اختياري — يُستخدم لفتح المعاملات">
            <input className="input mono" value={explorer} onChange={(e) => setExplorer(e.target.value)} placeholder="https://explorer.example.com" dir="ltr" />
          </Field>

          <div className="switch-row">
            <div><b className="small">تعيين الشبكة افتراضية بعد الإضافة</b></div>
            <Toggle on={makeDefault} onChange={setMakeDefault} />
          </div>

          <div className="row mt" style={{ gap: 9, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline" onClick={testRpc} disabled={testing}>
              {testing ? <><span className="spin" /> جارٍ الاختبار...</> : <><Icon name="zap" size={15} /> اختبار نقطة الاتصال</>}
            </button>
            <button type="button" className="btn btn-primary grow" onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : <Icon name="check" size={15} />} حفظ الشبكة
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => (dirty ? setDiscard(true) : go('network'))}>إلغاء</button>
          </div>

          {testResult && (
            <div className={`${testResult.ok ? 'info-strip' : 'error-strip'} mt`} style={{ marginTop: 14 }}>
              {testResult.ok ? (
                <><Icon name="check" size={15} /> {testResult.msg} — زمن الاستجابة {testResult.latency} مللي ثانية</>
              ) : (
                testResult.msg
              )}
            </div>
          )}
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="eye" size={15} className="green" /> المعاينة</h4>
            <KV k="الاسم" v={name || '—'} />
            <KV k="معرف السلسلة" v={chainId || '—'} mono />
            <KV k="عملة الرسوم" v={symbol || '—'} />
            <KV k="نقطة الاتصال" v={rpc ? rpc.replace(/^https?:\/\//, '').slice(0, 24) : '—'} mono />
            <KV k="حالة الفحص" v={testResult ? (testResult.ok ? <span className="green bold">ناجح</span> : <span className="red bold">فاشل</span>) : <span className="faint">لم يُختبر</span>} />
          </div>

          <div className="warn-strip">
            <Icon name="warning" size={15} /> تأكد من مصدر نقطة الاتصال — النقاط غير الموثوقة قد تعرض بيانات خاطئة.
          </div>

          <button type="button" className="btn btn-ghost btn-block" onClick={() => go('network-test')}>عرض شبكات الاختبار</button>
        </aside>
      </div>

      <ConfirmModal open={discard} onClose={() => setDiscard(false)} onConfirm={() => { setDiscard(false); go('network'); }} title="إلغاء إضافة الشبكة؟" confirmLabel="نعم، إلغاء" danger body={<p className="muted small">ستفقد البيانات المدخلة.</p>} />
    </div>
  );
}

/* ============================================================
   شاشة تفاصيل المحفظة — SCR-WAL-DETAIL
   ============================================================ */
export function WalletDetailScreen() {
  const { params, go, toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const wallet = {
    id: params.walletId ?? 'w1',
    addr: params.walletId === 'w2' ? '0xAbC3DeF1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7' : 'TLa5xQ7mKq2AbCdEfGhIjKlMnOpQrSt',
    label: params.walletId === 'w2' ? 'محفظة EVM' : 'المحفظة الرئيسية',
    isMain: !params.walletId || params.walletId === 'w1',
  };

  if (!wallet.addr) return <EmptyState icon="wallet" title="المحفظة غير موجودة" actionLabel="العودة لقائمة المحافظ" onAction={() => go('wallets')} />;

  const isTron = wallet.addr.startsWith('T');

  return (
    <div>
      <Breadcrumb items={[{ label: 'إدارة المحافظ', to: 'wallets' }, { label: 'تفاصيل المحفظة' }]} />
      <PageHead
        title={wallet.label}
        sub={wallet.isMain ? 'المحفظة الرئيسية النشطة' : 'محفظة إضافية مرتبطة'}
        backTo="wallets"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث الأرصدة'); }, 800); }}>
              <Icon name="refresh" size={14} /> تحديث الأرصدة
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('info', 'فتح المستكشف الخارجي (عرض تجريبي)')}>
              <Icon name="external" size={14} /> المستكشف
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go('send')}>
              <Icon name="send" size={14} /> إرسال من هذه المحفظة
            </button>
          </>
        }
      />

      {loading ? (
        <SkeletonCards count={4} />
      ) : (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon green"><Icon name="wallet" size={22} /></div>
            <div><div className="stat-label">رصيد التوكن</div><div className="stat-value" style={{ fontSize: 19 }}>9,915,000</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow"><Icon name="zap" size={22} /></div>
            <div><div className="stat-label">رصيد الرسوم</div><div className="stat-value" style={{ fontSize: 19 }}>{isTron ? '1,250 TRX' : '0.45 BNB'}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><Icon name="arrows" size={22} /></div>
            <div><div className="stat-label">إجمالي المعاملات</div><div className="stat-value">128</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Icon name="globe" size={22} /></div>
            <div><div className="stat-label">حالة الاتصال</div><div className="stat-value" style={{ fontSize: 17 }}><span className="dot green pulse" /> متصلة</div></div>
          </div>
        </div>
      )}

      <div className="content-grid">
        <div className="card">
          <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> هوية المحفظة</h4>
          <div className="wallet-addr-full">{wallet.addr}</div>
          <KV k="النوع" v={wallet.isMain ? 'رئيسية' : 'إضافية'} />
          <KV k="الشبكات المرتبطة" v={isTron ? 'TRC20' : 'ERC20 · BEP20'} />
          <KV k="تاريخ الربط" v="2026-08-01" />
          <div className="modal-sep" />
          <div className="row" style={{ gap: 9, flexWrap: 'wrap' }}>
            {!wallet.isMain && (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم تعيين المحفظة كرئيسية ⭐')}>
                <Icon name="check" size={14} /> تعيين رئيسية
              </button>
            )}
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setDisconnectOpen(true)}>
              <Icon name="logout" size={14} /> قطع الاتصال
            </button>
            {!wallet.isMain && (
              <button type="button" className="btn btn-sm btn-danger" onClick={() => setDelOpen(true)}>
                <Icon name="trash" size={14} /> حذف المحفظة
              </button>
            )}
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> إجراءات سريعة</h4>
            <div className="col" style={{ gap: 8 }}>
              <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('send')}><Icon name="send" size={14} /> إرسال من هذه المحفظة</button>
              <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('transactions')}><Icon name="clock" size={14} /> عرض معاملات المحفظة</button>
              <button type="button" className="btn btn-sm btn-ghost btn-block" onClick={() => { navigator.clipboard?.writeText(wallet.addr); toast('success', 'تم نسخ عنوان المحفظة ✅'); }}><Icon name="copy" size={14} /> نسخ العنوان</button>
            </div>
          </div>
        </aside>
      </div>

      <ConfirmModal open={disconnectOpen} onClose={() => setDisconnectOpen(false)} onConfirm={() => { setDisconnectOpen(false); toast('warning', 'تم قطع اتصال المحفظة'); go('wallets'); }} title="قطع اتصال المحفظة؟" confirmLabel="نعم، قطع الاتصال" danger body={<p className="muted small">يمكنك إعادة الربط في أي وقت.</p>} />
      <ConfirmModal open={delOpen} onClose={() => setDelOpen(false)} onConfirm={() => { setDelOpen(false); toast('success', 'تم حذف المحفظة ✅'); go('wallets'); }} title="حذف المحفظة؟" confirmLabel="نعم، حذف" danger body={<p className="muted small">سيتم إزالة المحفظة من النظام (لا يؤثر على الشبكة).</p>} />
    </div>
  );
}
