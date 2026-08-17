import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, Field, KV } from '../../components/ui/shared';
import { Tabs, ProgressBar, CopyBtn } from '../../components/ui/primitives';
import { ConfirmModal } from '../../components/ui/Modal';
import { NETWORKS } from '../../data/mock';
import { validateAddress, randHex } from '../../lib/format';

/* ============================================================
   استيراد محفظة — SCR-WAL-IMPORT
   ============================================================ */
export function WalletImportScreen() {
  const { go, toast } = useApp();
  const [tab, setTab] = useState('key');
  const [secret, setSecret] = useState('');
  const [show, setShow] = useState(false);
  const [network, setNetwork] = useState('TRON');
  const [label, setLabel] = useState('');
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [discard, setDiscard] = useState(false);

  const words = secret.trim().split(/\s+/).filter(Boolean);
  const keyValid = /^(0x)?[0-9a-fA-F]{64}$/.test(secret.trim());
  const phraseValid = [12, 15, 18, 21, 24].includes(words.length);
  const valid = tab === 'key' ? keyValid : phraseValid;
  const err =
    !secret.trim()
      ? null
      : tab === 'key'
        ? keyValid ? null : 'صيغة المفتاح الخاص غير صحيحة — يجب أن يتكون من 64 خانة ست عشرية'
        : phraseValid ? null : `عبارة الاسترداد يجب أن تكون 12 أو 24 كلمة (حاليًا ${words.length})`;

  const dirty = !!(secret || label);

  const submit = () => {
    if (!valid) return toast('error', 'تحقق من صحة البيانات المدخلة');
    if (!ack) return toast('warning', 'يجب الموافقة على تحذير الأمان');
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast('success', `تم استيراد ${label || 'المحفظة'} بنجاح ✅`);
      go('wallets');
    }, 1400);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'إدارة المحافظ', to: 'wallets' }, { label: 'استيراد محفظة' }]} />
      <PageHead title="استيراد محفظة" sub="أضف محفظة قائمة عبر المفتاح الخاص أو عبارة الاسترداد" backTo="wallets" />

      <div className="content-grid">
        <div className="card">
          <div className="error-strip mb">
            <Icon name="warning" size={15} /> لا تشارك مفتاحك الخاص أو عبارة الاسترداد مع أي شخص. تُخزَّن محليًا فقط ولا تُرسل لأي خادم.
          </div>

          <Tabs
            items={[
              { id: 'key', label: 'مفتاح خاص' },
              { id: 'phrase', label: 'عبارة استرداد' },
            ]}
            active={tab}
            onChange={(t) => { setTab(t); setSecret(''); }}
          />

          <div className="tab-pane" key={tab}>
            {tab === 'key' ? (
              <Field label="المفتاح الخاص" required error={err} ok={keyValid ? 'صيغة صحيحة' : undefined} hint="64 خانة ست عشرية، مع أو بدون البادئة 0x">
                <div className="input-wrap">
                  <input
                    className={`input mono ${secret && err ? 'invalid' : keyValid ? 'valid' : ''}`}
                    type={show ? 'text' : 'password'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="0x…"
                    dir="ltr"
                  />
                  <div className="input-icons">
                    <button type="button" className="icon-btn-sm" onClick={() => setShow(!show)} aria-label="إظهار">
                      <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
                    </button>
                    <button type="button" className="icon-btn-sm" onClick={async () => { try { setSecret(await navigator.clipboard.readText()); } catch { toast('error', 'تعذّر القراءة من الحافظة'); } }} aria-label="لصق">
                      <Icon name="paste" size={15} />
                    </button>
                  </div>
                </div>
              </Field>
            ) : (
              <Field label="عبارة الاسترداد" required error={err} ok={phraseValid ? `${words.length} كلمة — صيغة صحيحة` : undefined} hint="افصل بين الكلمات بمسافة واحدة">
                <textarea
                  className={`input textarea mono ${secret && err ? 'invalid' : phraseValid ? 'valid' : ''}`}
                  rows={4}
                  value={show ? secret : secret.replace(/\S/g, '•')}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="word1 word2 word3 …"
                  dir="ltr"
                  onFocus={() => setShow(true)}
                />
                <div className="row mt-sm" style={{ gap: 8 }}>
                  <span className="tiny faint grow">عدد الكلمات: {words.length}</span>
                  <button type="button" className="btn btn-xs btn-ghost" onClick={() => setShow(!show)}>
                    <Icon name={show ? 'eyeOff' : 'eye'} size={12} /> {show ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </Field>
            )}

            <div className="grid-2">
              <Field label="الشبكة" required>
                <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
                  {NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>{n.name} — {n.standard}</option>
                  ))}
                </select>
              </Field>
              <Field label="اسم العرض" hint="اسم داخلي لتمييز المحفظة">
                <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: محفظة التوزيع" maxLength={32} />
              </Field>
            </div>

            <label className={`check-row ${!ack && secret ? '' : ''}`}>
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              <span className="c-mark"><Icon name="check" size={12} strokeWidth={3} /></span>
              <span className="small">أُقرّ بأنني المسؤول الوحيد عن حفظ هذه البيانات، وأن فقدانها يعني فقدان الوصول للمحفظة نهائيًا.</span>
            </label>

            <div className="row mt" style={{ gap: 9 }}>
              <button type="button" className="btn btn-primary grow" onClick={submit} disabled={busy || !valid || !ack}>
                {busy ? <><span className="spin" /> جارٍ الاستيراد...</> : <><Icon name="download" size={15} /> استيراد المحفظة</>}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => (dirty ? setDiscard(true) : go('wallets'))}>إلغاء</button>
            </div>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="shieldCheck" size={15} className="green" /> ملاحظات أمان</h4>
            <ul className="req-list">
              <li className="ok">التخزين محلي داخل المتصفح فقط</li>
              <li className="ok">لا يتم إرسال المفاتيح لأي خادم</li>
              <li className="ok">يمكنك حذف المحفظة في أي وقت</li>
            </ul>
          </div>
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> بدائل الربط</h4>
            <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('wallet-connect')}>
              <Icon name="qr" size={14} /> ربط محفظة خارجية عبر QR
            </button>
            <button type="button" className="btn btn-sm btn-ghost btn-block" onClick={() => go('wallets')}>
              العودة لقائمة المحافظ
            </button>
          </div>
        </aside>
      </div>

      <ConfirmModal open={discard} onClose={() => setDiscard(false)} onConfirm={() => { setDiscard(false); go('wallets'); }} title="إلغاء الاستيراد؟" confirmLabel="نعم، إلغاء" danger body={<p className="muted small">ستفقد البيانات المدخلة ولن يتم حفظ أي شيء.</p>} />
    </div>
  );
}

/* ============================================================
   ربط محفظة خارجية — SCR-WAL-CONNECT
   ============================================================ */
export function WalletConnectScreen() {
  const { go, toast } = useApp();
  const [code] = useState(() => `ts-link:${randHex(24)}`);
  const [left, setLeft] = useState(120);
  const [phase, setPhase] = useState<'wait' | 'approved' | 'expired'>('wait');
  const [manual, setManual] = useState('');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'wait') return;
    timer.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { setPhase('expired'); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [phase]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  const manualErr = manual && !(validateAddress(manual, 'TRON') || validateAddress(manual, 'EVM') || validateAddress(manual, 'SOL')) ? 'صيغة العنوان غير معروفة' : null;

  return (
    <div>
      <Breadcrumb items={[{ label: 'إدارة المحافظ', to: 'wallets' }, { label: 'ربط محفظة خارجية' }]} />
      <PageHead title="ربط محفظة خارجية" sub="امسح الرمز من تطبيق المحفظة لديك للموافقة على الربط" backTo="wallets" />

      <div className="content-grid">
        <div className="card center-cell">
          {phase === 'wait' && (
            <>
              <div className="qr-frame">
                <div className="qr-grid" aria-hidden>
                  {Array.from({ length: 144 }).map((_, i) => {
                    const on = (i * 7 + ((i / 12) | 0) * 5) % 3 !== 0;
                    return <span key={i} className={on ? 'qr-cell on' : 'qr-cell'} />;
                  })}
                </div>
                <div className="qr-badge"><Icon name="link" size={18} /></div>
              </div>

              <p className="muted small mt">امسح الرمز عبر تطبيق المحفظة، أو انسخ رمز الربط يدويًا.</p>

              <div className="link-code-row">
                <code className="mono-cell grow">{code}</code>
                <CopyBtn text={code} small label="نسخ" />
              </div>

              <div className="expiry-block">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="small faint">تنتهي صلاحية الرمز خلال</span>
                  <b className={`mono-cell ${left < 30 ? 'red' : ''}`}>{mm}:{ss}</b>
                </div>
                <ProgressBar pct={(left / 120) * 100} thin />
              </div>

              <div className="awaiting-row">
                <span className="spin" /> بانتظار موافقة المحفظة...
              </div>

              <div className="row mt" style={{ gap: 9 }}>
                <button type="button" className="btn btn-primary" onClick={() => { setPhase('approved'); toast('success', 'تمت الموافقة على الربط ✅'); }}>
                  محاكاة الموافقة
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => go('wallets')}>إلغاء</button>
              </div>
            </>
          )}

          {phase === 'expired' && (
            <>
              <div className="state-illus warning"><Icon name="clock" size={38} /></div>
              <h3 className="state-title">انتهت صلاحية رمز الربط</h3>
              <p className="state-sub">لم تصل موافقة خلال دقيقتين. أنشئ رمزًا جديدًا للمحاولة مجددًا.</p>
              <div className="state-actions">
                <button type="button" className="btn btn-primary" onClick={() => { setLeft(120); setPhase('wait'); }}>
                  <Icon name="refresh" size={15} /> إنشاء رمز جديد
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => go('wallets')}>العودة</button>
              </div>
            </>
          )}

          {phase === 'approved' && (
            <>
              <div className="state-illus"><Icon name="check" size={38} strokeWidth={3} /></div>
              <h3 className="state-title">تم ربط المحفظة بنجاح</h3>
              <p className="state-sub">أصبحت المحفظة متاحة ضمن قائمة المحافظ ويمكن استخدامها في الإرسال والسك.</p>
              <div className="state-actions">
                <button type="button" className="btn btn-primary" onClick={() => go('wallets')}>عرض المحافظ</button>
                <button type="button" className="btn btn-outline" onClick={() => go('wallet-detail', { walletId: 'w2' })}>فتح تفاصيل المحفظة</button>
              </div>
            </>
          )}
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> خطوات الربط</h4>
            <ol className="steps-list static">
              <li>افتح تطبيق المحفظة على هاتفك.</li>
              <li>اختر «مسح رمز» أو «اتصال بموقع».</li>
              <li>امسح الرمز الظاهر هنا.</li>
              <li>وافق على طلب الاتصال داخل التطبيق.</li>
            </ol>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="edit" size={15} className="green" /> إدخال يدوي</h4>
            <Field label="عنوان المحفظة" error={manualErr}>
              <input className={`input mono ${manualErr ? 'invalid' : ''}`} value={manual} onChange={(e) => setManual(e.target.value)} placeholder="T… / 0x…" dir="ltr" />
            </Field>
            <button type="button" className="btn btn-sm btn-outline btn-block" disabled={!manual || !!manualErr} onClick={() => { setPhase('approved'); toast('success', 'تمت إضافة المحفظة للمراقبة ✅'); }}>
              إضافة كمحفظة مراقبة
            </button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="wallet" size={15} className="green" /> معلومات الجلسة</h4>
            <KV k="نوع الربط" v="قراءة + توقيع" />
            <KV k="مدة الصلاحية" v="دقيقتان" />
            <KV k="التشفير" v="محلي — لا يُرسل شيء" tone="green" />
          </div>
        </aside>
      </div>
    </div>
  );
}
