import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Field, FileDrop } from '../../components/ui/shared';
import { Tabs, Toggle, ProgressBar } from '../../components/ui/primitives';
import { Modal } from '../../components/ui/Modal';
import { SYSTEM_INFO, TERMS_DOC, POLICIES_DOC } from '../../data/system';

/* ============================================================
   الغلاف المشترك لشاشات الدخول والتحقق
   ============================================================ */
function AuthShell({
  children,
  logo,
  steps,
  width = 460,
}: {
  children: ReactNode;
  logo?: boolean;
  steps?: { label: string; done: boolean; active: boolean }[];
  width?: number;
}) {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: width }}>
        {logo && (
          <div className="auth-logo">
            <div className="logo-mark lg">T</div>
            <h2>استوديو التوكن</h2>
            <p className="muted small">نظام إدارة العقود الذكية</p>
          </div>
        )}
        {steps && (
          <div className="auth-steps">
            {steps.map((s, i) => (
              <span key={s.label} className={`auth-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}>
                <i>{s.done ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</i>
                {s.label}
              </span>
            ))}
          </div>
        )}
        {children}
      </div>
      <div className="auth-footer">{SYSTEM_INFO.version} — بناء {SYSTEM_INFO.build}</div>
    </div>
  );
}

const SETUP_STEPS = ['الشروط', 'رمز الحماية', 'التأكيد', 'المحفظة'];
const stepsFor = (idx: number) =>
  SETUP_STEPS.map((label, i) => ({ label, done: i < idx, active: i === idx }));

/* ============================================================
   شاشة الإقلاع — SCR-AUTH-BOOT
   ============================================================ */
export function BootScreen() {
  const { go, toast } = useApp();
  const [pct, setPct] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setPct(0);
    setFailed(false);
    let p = 0;
    const t = setInterval(() => {
      p += 6 + Math.random() * 9;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setTimeout(() => go('welcome'), 350);
      }
      setPct(p);
    }, 110);
    return () => clearInterval(t);
  }, [attempt, go]);

  return (
    <AuthShell logo width={420}>
      <p className="center muted small mb">{failed ? 'تعذر تهيئة النظام' : 'جارٍ تهيئة النظام...'}</p>
      {!failed ? (
        <>
          <ProgressBar pct={pct} />
          <div className="center tiny faint mt-sm">{Math.round(pct)}%</div>
        </>
      ) : (
        <>
          <div className="error-strip mb">BOOT_INIT_FAILED — تعذر تهيئة وحدات النظام</div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              setAttempt((a) => a + 1);
              toast('info', 'جارٍ إعادة تهيئة النظام...');
            }}
          >
            <Icon name="refresh" size={15} /> إعادة تهيئة النظام
          </button>
        </>
      )}
      <div className="center mt">
        <button type="button" className="btn-text-blue" onClick={() => setFailed((f) => !f)}>
          {failed ? 'إخفاء حالة الفشل' : 'محاكاة فشل التهيئة'}
        </button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة الترحيب — SCR-AUTH-WELCOME
   ============================================================ */
export function WelcomeScreen() {
  const { go } = useApp();
  return (
    <AuthShell logo>
      <div className="auth-illus">
        <Icon name="rocket" size={46} />
      </div>
      <h3 className="center" style={{ fontSize: 18, marginBottom: 6 }}>إعداد الوصول الأول</h3>
      <p className="center muted small mb">
        سنجهّز رمز الحماية ومحفظتك الأولى في أربع خطوات سريعة، ثم تنتقل مباشرة إلى لوحة التحكم.
      </p>
      <div className="col" style={{ gap: 10 }}>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => go('terms-accept')}>
          بدء الإعداد <Icon name="arrowLeft" size={17} />
        </button>
        <button type="button" className="btn btn-outline btn-block" onClick={() => go('recover')}>
          استعادة وصول سابق
        </button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة الموافقة على الشروط — SCR-AUTH-TERMS
   ============================================================ */
export function TermsAcceptScreen() {
  const { go, toast } = useApp();
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [err, setErr] = useState(false);
  const [doc, setDoc] = useState<'terms' | 'policies' | null>(null);

  const next = () => {
    if (!a1 || !a2) {
      setErr(true);
      toast('warning', 'يجب تأكيد الموافقتين قبل المتابعة');
      return;
    }
    go('pin-create');
  };

  return (
    <AuthShell steps={stepsFor(0)} width={560}>
      <h3 style={{ fontSize: 18 }}>شروط الاستخدام</h3>
      <p className="muted small mb">الموافقة مطلوبة قبل المتابعة</p>

      <div className="doc-scroll mb">
        {TERMS_DOC.slice(0, 5).map((s) => (
          <div key={s.title} className="doc-item">
            <b>{s.title}</b>
            <p className="muted small">{s.body}</p>
          </div>
        ))}
      </div>

      <label className={`check-row ${err && !a1 ? 'invalid' : ''}`}>
        <input type="checkbox" checked={a1} onChange={(e) => { setA1(e.target.checked); setErr(false); }} />
        <span className="c-mark"><Icon name="check" size={12} strokeWidth={3.5} /></span>
        أوافق على شروط الاستخدام
      </label>
      <label className={`check-row ${err && !a2 ? 'invalid' : ''}`}>
        <input type="checkbox" checked={a2} onChange={(e) => { setA2(e.target.checked); setErr(false); }} />
        <span className="c-mark"><Icon name="check" size={12} strokeWidth={3.5} /></span>
        أوافق على سياسة الاستخدام
      </label>

      {err && (
        <div className="field-error mt-sm">
          <Icon name="warning" size={13} /> يجب تأكيد الموافقتين
        </div>
      )}

      <div className="row mt" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn-text-blue" onClick={() => setDoc('terms')}>قراءة الشروط كاملة</button>
        <span className="faint">·</span>
        <button type="button" className="btn-text-blue" onClick={() => setDoc('policies')}>قراءة السياسات كاملة</button>
      </div>

      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => go('welcome')}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
        <button type="button" className="btn btn-primary grow" onClick={next}>
          المتابعة للإعداد <Icon name="arrowLeft" size={16} />
        </button>
      </div>

      <Modal open={doc !== null} onClose={() => setDoc(null)} size="lg" title={doc === 'terms' ? 'شروط الاستخدام' : 'سياسات الاستخدام'}>
        <div className="doc-scroll tall">
          {(doc === 'terms' ? TERMS_DOC : POLICIES_DOC).map((s) => (
            <div key={s.title} className="doc-item">
              <b>{s.title}</b>
              <p className="muted small">{s.body}</p>
            </div>
          ))}
        </div>
      </Modal>
    </AuthShell>
  );
}

/* ============================================================
   قوة رمز الحماية
   ============================================================ */
function pinStrength(v: string): { score: number; label: string; cls: string } {
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const labels = ['ضعيف جدًا', 'ضعيف', 'متوسط', 'جيد', 'قوي', 'قوي جدًا'];
  const cls = s <= 1 ? 'bad' : s <= 3 ? 'mid' : 'good';
  return { score: s, label: labels[s], cls };
}

/* شاشة إنشاء رمز الحماية — SCR-AUTH-PIN-NEW */
export function PinCreateScreen() {
  const { go, toast } = useApp();
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const st = pinStrength(pin);
  const tooShort = pin.length > 0 && pin.length < 6;

  const next = () => {
    setTouched(true);
    if (pin.length < 6) {
      toast('error', 'رمز الحماية يجب ألا يقل عن 6 خانات');
      return;
    }
    try { sessionStorage.setItem('ts_pin', pin); } catch { /* التخزين غير متاح */ }
    go('pin-confirm');
  };

  return (
    <AuthShell steps={stepsFor(1)}>
      <h3 style={{ fontSize: 18 }}>إنشاء رمز الحماية</h3>
      <p className="muted small mb">رمز الحماية يفتح النظام في كل مرة</p>

      <Field
        label="رمز الحماية"
        required
        error={touched && pin.length < 6 ? 'يجب ألا يقل الرمز عن 6 خانات' : null}
        ok={pin.length >= 6 ? 'رمز صالح' : null}
        hint="استخدم 6 خانات فأكثر مع مزيج من الأحرف والأرقام"
      >
        <div className="input-wrap">
          <input
            className={`input ${tooShort && touched ? 'invalid' : pin.length >= 6 ? 'valid' : ''}`}
            type={show ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
          <div className="input-icons">
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="إظهار رمز الحماية">
              <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>
      </Field>

      <div className="strength">
        <div className={`strength-bar ${st.cls}`}>
          <i style={{ width: `${(st.score / 5) * 100}%` }} />
        </div>
        <span className={`tiny bold ${st.cls === 'good' ? 'green' : st.cls === 'mid' ? 'yellow' : 'red'}`}>{st.label}</span>
      </div>

      <ul className="req-list">
        <li className={pin.length >= 6 ? 'ok' : ''}><Icon name={pin.length >= 6 ? 'check' : 'x'} size={12} /> 6 خانات على الأقل</li>
        <li className={/\d/.test(pin) ? 'ok' : ''}><Icon name={/\d/.test(pin) ? 'check' : 'x'} size={12} /> رقم واحد على الأقل</li>
        <li className={/[A-Za-z]/.test(pin) ? 'ok' : ''}><Icon name={/[A-Za-z]/.test(pin) ? 'check' : 'x'} size={12} /> حرف واحد على الأقل</li>
      </ul>

      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => go('terms-accept')}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
        <button type="button" className="btn btn-primary grow" onClick={next}>
          المتابعة للتأكيد <Icon name="arrowLeft" size={16} />
        </button>
      </div>
    </AuthShell>
  );
}

/* شاشة تأكيد رمز الحماية — SCR-AUTH-PIN-CONFIRM */
export function PinConfirmScreen() {
  const { go, toast } = useApp();
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const original = (() => { try { return sessionStorage.getItem('ts_pin') ?? ''; } catch { return ''; } })();

  const confirm = () => {
    if (pin !== original) {
      setErr('رمز الحماية غير مطابق');
      toast('error', 'رمز الحماية غير مطابق');
      return;
    }
    toast('success', 'تم تثبيت رمز الحماية ✅');
    go('first-wallet');
  };

  return (
    <AuthShell steps={stepsFor(2)}>
      <h3 style={{ fontSize: 18 }}>تأكيد رمز الحماية</h3>
      <p className="muted small mb">أعد إدخال رمز الحماية نفسه</p>

      <Field label="تأكيد رمز الحماية" required error={err} ok={pin && pin === original ? 'مطابق' : null}>
        <div className="input-wrap">
          <input
            className={`input ${err ? 'invalid' : pin && pin === original ? 'valid' : ''}`}
            type={show ? 'text' : 'password'}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setErr(null); }}
            placeholder="••••••••"
            autoFocus
          />
          <div className="input-icons">
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="إظهار رمز التأكيد">
              <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>
      </Field>

      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => go('pin-create')}>
          <Icon name="arrowRight" size={15} /> تعديل رمز الحماية
        </button>
        <button type="button" className="btn btn-primary grow" onClick={confirm} disabled={!pin}>
          <Icon name="shieldCheck" size={16} /> تثبيت رمز الحماية
        </button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة فتح القفل — SCR-AUTH-UNLOCK
   ============================================================ */
export function UnlockScreen() {
  const { go, toast, setLocked } = useApp();
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [err, setErr] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(0);

  useEffect(() => {
    if (lockedOut <= 0) return;
    const t = setInterval(() => setLockedOut((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockedOut]);

  const unlock = () => {
    if (!pin) {
      setErr('أدخل رمز الحماية');
      return;
    }
    /* عرض تجريبي: أي رمز من 6 خانات فأكثر يفتح النظام */
    if (pin.length >= 6) {
      setLocked(false);
      toast('success', 'تم فتح النظام ✅');
      go('two-factor');
      return;
    }
    const left = attempts - 1;
    setAttempts(left);
    setErr(`رمز حماية غير صحيح — المحاولات المتبقية: ${left}`);
    if (left <= 0) {
      setLockedOut(30);
      setAttempts(3);
      toast('error', 'تم قفل الإدخال مؤقتًا لمدة 30 ثانية');
    }
  };

  return (
    <AuthShell logo>
      <h3 className="center" style={{ fontSize: 17 }}>فتح القفل</h3>
      <p className="center muted small mb">أدخل رمز الحماية للمتابعة</p>

      <Field label="رمز الحماية" error={err}>
        <div className="input-wrap">
          <input
            className={`input ${err ? 'invalid' : ''}`}
            type={show ? 'text' : 'password'}
            value={pin}
            disabled={lockedOut > 0}
            onChange={(e) => { setPin(e.target.value); setErr(null); }}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
            placeholder="••••••••"
            autoFocus
          />
          <div className="input-icons">
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="إظهار رمز الحماية">
              <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>
        </div>
      </Field>

      <div className="row between small muted mb">
        <span>المحاولات المتبقية: <b className={attempts <= 1 ? 'red' : ''}>{attempts}</b></span>
        {lockedOut > 0 && <span className="red bold">مقفل مؤقتًا: {lockedOut}ث</span>}
      </div>

      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={unlock} disabled={lockedOut > 0}>
        <Icon name="lock" size={16} /> فتح النظام
      </button>
      <div className="center mt">
        <button type="button" className="btn-text-blue" onClick={() => go('recover')}>نسيت رمز الحماية؟</button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة التحقق بخطوتين — SCR-AUTH-2FA
   ============================================================ */
export function TwoFactorScreen() {
  const { go, toast } = useApp();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [left, setLeft] = useState(60);
  const [attempts, setAttempts] = useState(3);
  const [err, setErr] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? clean : x)));
    setErr(null);
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const code = digits.join('');

  const verify = () => {
    if (code.length < 6) {
      setErr('أكمل خانات رمز التحقق');
      return;
    }
    /* عرض تجريبي: أي رمز مكوّن من 6 أرقام يُقبل */
    toast('success', 'تم التحقق بنجاح ✅');
    go('dashboard');
  };

  const resend = () => {
    setLeft(60);
    setAttempts(3);
    setDigits(['', '', '', '', '', '']);
    toast('info', 'تم إرسال رمز تحقق جديد');
  };

  return (
    <AuthShell logo width={440}>
      <h3 className="center" style={{ fontSize: 17 }}>التحقق بخطوتين</h3>
      <p className="center muted small mb">أدخل رمز التحقق المؤقت المكوّن من 6 أرقام</p>

      <div className="otp-row">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`otp-box ${err ? 'invalid' : d ? 'filled' : ''}`}
            inputMode="numeric"
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === 'Enter') verify();
            }}
            disabled={left === 0}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {err && <div className="field-error center" style={{ justifyContent: 'center' }}><Icon name="warning" size={13} /> {err}</div>}

      <div className="mt">
        <ProgressBar pct={(left / 60) * 100} thin />
        <div className="row between tiny muted mt-sm">
          <span>صلاحية الرمز: <b className={left < 15 ? 'red' : 'green'}>{left}ث</b></span>
          <span>المحاولات المتبقية: <b>{attempts}</b></span>
        </div>
      </div>

      <button type="button" className="btn btn-primary btn-lg btn-block mt" onClick={verify} disabled={left === 0}>
        <Icon name="shieldCheck" size={16} /> تأكيد رمز التحقق
      </button>
      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-outline grow" onClick={resend}>
          <Icon name="refresh" size={14} /> إعادة إرسال الرمز
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setAttempts(3); go('unlock'); }}>
          رجوع
        </button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة استعادة الوصول — SCR-AUTH-RECOVER
   ============================================================ */
export function RecoverScreen() {
  const { go, toast } = useApp();
  const [tab, setTab] = useState('seed');
  const [is24, setIs24] = useState(false);
  const [words, setWords] = useState<string[]>(Array(24).fill(''));
  const [file, setFile] = useState<string | null>(null);
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const count = is24 ? 24 : 12;
  const filled = words.slice(0, count).filter((w) => w.trim()).length;
  const allFilled = filled === count;

  const start = () => {
    setErr(null);
    if (tab === 'seed' && !allFilled) {
      setErr('أكمل جميع كلمات عبارة الاسترداد');
      return;
    }
    if (tab === 'file' && (!file || !pass)) {
      setErr('اختر ملف النسخة وأدخل كلمة الحماية');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast('success', 'تمت استعادة الوصول بنجاح ✅');
      go('dashboard');
    }, 1400);
  };

  return (
    <AuthShell width={620}>
      <h3 style={{ fontSize: 18 }}>استعادة الوصول</h3>
      <p className="muted small mb">اختر طريقة الاستعادة</p>

      <Tabs
        items={[
          { id: 'seed', label: 'بعبارة الاسترداد' },
          { id: 'file', label: 'بملف النسخة الاحتياطية' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'seed' ? (
        <div className="tab-pane">
          <div className="row between mb">
            <Toggle on={is24} onChange={setIs24} label="عبارة من 24 كلمة" />
            <span className={`tiny bold ${allFilled ? 'green' : 'muted'}`}>{filled}/{count} كلمة</span>
          </div>
          <div className="seed-grid">
            {Array.from({ length: count }).map((_, i) => (
              <label key={i}>
                <span className="seed-num">{i + 1}</span>
                <input
                  className="seed-input"
                  value={words[i]}
                  onChange={(e) => setWords((w) => w.map((x, j) => (j === i ? e.target.value : x)))}
                />
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="tab-pane">
          <FileDrop
            accept=".json,.bak,.txt"
            hint="ملف بصيغة .json أو .bak"
            fileName={file}
            onFile={(name) => { setFile(name); toast('success', 'تم اختيار الملف'); }}
          />
          <Field label="كلمة حماية ملف النسخة الاحتياطية" required>
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          </Field>
        </div>
      )}

      {err && <div className="field-error"><Icon name="warning" size={13} /> {err}</div>}

      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => go('unlock')}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
        <button type="button" className="btn btn-primary grow" onClick={start} disabled={busy}>
          {busy ? <><span className="spin" /> جارٍ الاستعادة...</> : <><Icon name="key" size={15} /> بدء الاستعادة</>}
        </button>
      </div>
    </AuthShell>
  );
}

/* ============================================================
   شاشة ربط المحفظة الأولى — SCR-AUTH-WALLET-FIRST
   ============================================================ */
export function FirstWalletScreen() {
  const { go, toast } = useApp();
  const [mode, setMode] = useState<'key' | 'seed' | 'external' | null>(null);
  const [pk, setPk] = useState('');
  const [show, setShow] = useState(false);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [qrLeft, setQrLeft] = useState(120);

  useEffect(() => {
    if (mode !== 'external') return;
    setQrLeft(120);
    const t = setInterval(() => setQrLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [mode]);

  const finish = (msg: string) => {
    setMode(null);
    toast('success', msg);
    go('dashboard');
  };

  return (
    <AuthShell steps={stepsFor(3)} width={620}>
      <h3 style={{ fontSize: 18 }}>ربط المحفظة الأولى</h3>
      <p className="muted small mb">اختر طريقة ربط المحفظة</p>

      <div className="warn-strip mb">
        <Icon name="warning" size={15} /> لا توجد محفظة مرتبطة بعد
      </div>

      <div className="pick-grid">
        <button type="button" className="pick-card" onClick={() => setMode('key')}>
          <span className="pick-icon"><Icon name="key" size={22} /></span>
          <b>استيراد بالمفتاح الخاص</b>
          <span className="tiny faint">الصق المفتاح الخاص للمحفظة</span>
        </button>
        <button type="button" className="pick-card" onClick={() => setMode('seed')}>
          <span className="pick-icon"><Icon name="book" size={22} /></span>
          <b>استيراد بعبارة الاسترداد</b>
          <span className="tiny faint">12 أو 24 كلمة</span>
        </button>
        <button type="button" className="pick-card" onClick={() => setMode('external')}>
          <span className="pick-icon"><Icon name="qr" size={22} /></span>
          <b>ربط محفظة خارجية</b>
          <span className="tiny faint">MetaMask · TronLink · WalletConnect</span>
        </button>
      </div>

      <div className="center mt">
        <button type="button" className="btn btn-ghost" onClick={() => { toast('info', 'تم تخطي ربط المحفظة — يمكنك الربط لاحقًا'); go('dashboard'); }}>
          تخطي الربط الآن ←
        </button>
      </div>

      {/* نافذة الاستيراد بالمفتاح */}
      <Modal open={mode === 'key'} onClose={() => setMode(null)} title="استيراد بالمفتاح الخاص">
        <Field label="المفتاح الخاص" required hint="لن يغادر المفتاح متصفحك في هذا العرض التجريبي">
          <div className="input-wrap">
            <input className="input mono" type={show ? 'text' : 'password'} value={pk} onChange={(e) => setPk(e.target.value)} placeholder="0x..." />
            <div className="input-icons">
              <button type="button" onClick={() => setShow((s) => !s)} aria-label="إظهار"><Icon name={show ? 'eyeOff' : 'eye'} size={15} /></button>
            </div>
          </div>
        </Field>
        <button type="button" className="btn btn-primary btn-block" disabled={pk.trim().length < 20} onClick={() => finish('تم ربط المحفظة بنجاح ✅')}>
          استيراد المحفظة
        </button>
      </Modal>

      {/* نافذة عبارة الاسترداد */}
      <Modal open={mode === 'seed'} onClose={() => setMode(null)} size="lg" title="استيراد بعبارة الاسترداد">
        <div className="seed-grid mb">
          {words.map((w, i) => (
            <label key={i}>
              <span className="seed-num">{i + 1}</span>
              <input className="seed-input" value={w} onChange={(e) => setWords((ws) => ws.map((x, j) => (j === i ? e.target.value : x)))} />
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-block" disabled={words.some((w) => !w.trim())} onClick={() => finish('تم ربط المحفظة من عبارة الاسترداد ✅')}>
          استيراد المحفظة
        </button>
      </Modal>

      {/* نافذة الربط الخارجي */}
      <Modal open={mode === 'external'} onClose={() => setMode(null)} title="ربط محفظة خارجية">
        <div className="qr-box mb">
          <div className="qr-frame" />
        </div>
        <div className="row between small muted mb">
          <span>في انتظار موافقة المحفظة الخارجية...</span>
          <b className={qrLeft < 20 ? 'red' : 'green'}>{qrLeft}ث</b>
        </div>
        <ProgressBar pct={(qrLeft / 120) * 100} thin />
        <div className="row mt" style={{ gap: 9 }}>
          <button type="button" className="btn btn-outline grow" onClick={() => { setQrLeft(120); toast('info', 'تم تحديث رمز الربط'); }}>
            <Icon name="refresh" size={14} /> تحديث الرمز
          </button>
          <button type="button" className="btn btn-primary grow" onClick={() => finish('تم ربط المحفظة الخارجية ✅')}>
            محاكاة الموافقة
          </button>
        </div>
      </Modal>
    </AuthShell>
  );
}
