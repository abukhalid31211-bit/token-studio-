import { useEffect, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { PageHead, Field, UnsavedBar, KV, FileDrop } from '../../components/ui/shared';
import { Tabs, Toggle, ProgressBar, CopyBtn } from '../../components/ui/primitives';
import { ConfirmModal, Modal } from '../../components/ui/Modal';
import { DEFAULT_SETTINGS, BACKUP_LOG, SYSTEM_INFO, PROFILE } from '../../data/system';
import type { AppSettings } from '../../data/system';
import { fmt, downloadFile } from '../../lib/format';

const TABS = [
  { id: 'general', label: 'الإعدادات العامة' },
  { id: 'security', label: 'الأمان' },
  { id: 'limits', label: 'الحدود والترخيص' },
  { id: 'notif', label: 'الإشعارات' },
  { id: 'backup', label: 'النسخ الاحتياطي' },
  { id: 'about', label: 'حول النظام' },
];

function pinStrength(v: string) {
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return { score: s, label: ['ضعيف جدًا', 'ضعيف', 'متوسط', 'جيد', 'قوي', 'قوي جدًا'][s], cls: s <= 1 ? 'bad' : s <= 3 ? 'mid' : 'good' };
}

export function SettingsScreen() {
  const { settings, setSettings, params, go, toast, pushNotification } = useApp();
  const [tab, setTab] = useState(params.settingsTab ?? 'general');
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => { if (params.settingsTab) setTab(params.settingsTab); }, [params.settingsTab]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSettings(draft);
      setSaving(false);
      toast('success', 'تم حفظ الإعدادات ✅');
    }, 700);
  };

  const restoreDefaults = () => {
    setDraft(DEFAULT_SETTINGS);
    setResetOpen(false);
    toast('info', 'تمت استعادة الإعدادات الافتراضية — لا تنسَ الحفظ');
  };

  return (
    <div style={{ paddingBottom: dirty ? 70 : 0 }}>
      <PageHead
        title="الإعدادات"
        sub="تفضيلات العرض والأمان والحدود والإشعارات"
        actions={
          tab !== 'about' && tab !== 'backup' ? (
            <>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setResetOpen(true)}>
                <Icon name="refresh" size={14} /> استعادة الافتراضي
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={save} disabled={!dirty || saving}>
                {saving ? <span className="spin" /> : <Icon name="check" size={14} />} حفظ
              </button>
            </>
          ) : undefined
        }
      />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="tab-pane" key={tab}>
        {tab === 'general' && <GeneralTab draft={draft} set={set} />}
        {tab === 'security' && <SecurityTab draft={draft} set={set} />}
        {tab === 'limits' && <LimitsTab draft={draft} set={set} />}
        {tab === 'notif' && <NotifTab draft={draft} set={set} />}
        {tab === 'backup' && <BackupTab draft={draft} set={set} onNotify={pushNotification} />}
        {tab === 'about' && <AboutTab />}
      </div>

      <UnsavedBar show={dirty} onSave={save} onCancel={() => setDiscardOpen(true)} saving={saving} />

      <ConfirmModal open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={restoreDefaults} title="استعادة الإعدادات الافتراضية؟" confirmLabel="نعم، استعادة" danger body={<p className="muted small">سيتم إرجاع كل القيم إلى الوضع الافتراضي في هذا التبويب وبقية التبويبات.</p>} />
      <ConfirmModal open={discardOpen} onClose={() => setDiscardOpen(false)} onConfirm={() => { setDraft(settings); setDiscardOpen(false); toast('info', 'أُلغيت التعديلات'); }} title="إلغاء التعديلات؟" confirmLabel="نعم، إلغاء" danger body={<p className="muted small">ستفقد التغييرات غير المحفوظة.</p>} />

      {tab !== 'about' && (
        <div className="row mt-lg" style={{ gap: 14, flexWrap: 'wrap' }}>
          <button type="button" className="btn-text-blue" onClick={() => go('profile')}>فتح الملف الشخصي</button>
          <button type="button" className="btn-text-blue" onClick={() => go('activity')}>فتح سجل النشاط</button>
          <button type="button" className="btn-text-blue" onClick={() => go('sessions')}>الجلسات النشطة</button>
        </div>
      )}
    </div>
  );
}

type SetFn = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => void;

/* ---------------- الإعدادات العامة ---------------- */
function GeneralTab({ draft, set }: { draft: AppSettings; set: SetFn }) {
  return (
    <div className="content-grid">
      <div className="card">
        <h4 className="card-title h4"><Icon name="settings" size={15} className="green" /> تفضيلات العرض</h4>
        <div className="grid-2">
          <Field label="لغة الواجهة">
            <select className="input" value={draft.language} onChange={(e) => set('language', e.target.value)}>
              {['العربية', 'English'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="تنسيق عرض الأرقام">
            <select className="input" value={draft.numberFormat} onChange={(e) => set('numberFormat', e.target.value)}>
              {['1,234,567.89', '1.234.567,89', '1 234 567.89'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="المنطقة الزمنية للعرض">
            <select className="input" value={draft.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {['آسيا/عدن (GMT+3)', 'آسيا/الرياض (GMT+3)', 'آسيا/دبي (GMT+4)', 'UTC (GMT+0)'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="الشاشة الافتراضية بعد الدخول">
            <select className="input" value={draft.defaultScreen} onChange={(e) => set('defaultScreen', e.target.value)}>
              {['لوحة التحكم', 'وحدة السك', 'وحدة الإرسال', 'سجل المعاملات'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>

        <div className="modal-sep" />
        <div className="switch-row">
          <div><b className="small">عرض القيم المختصرة</b><div className="tiny faint">إظهار 1.2M بدل 1,200,000</div></div>
          <Toggle on={draft.compactValues} onChange={(v) => set('compactValues', v)} />
        </div>
        <div className="switch-row">
          <div><b className="small">تأكيد الإجراءات الحساسة</b><div className="tiny faint">طلب تأكيد قبل السك والإرسال والحذف</div></div>
          <Toggle on={draft.confirmSensitive} onChange={(v) => set('confirmSensitive', v)} />
        </div>
        <div className="switch-row">
          <div><b className="small">نسخ معرف المعاملة تلقائيًا</b><div className="tiny faint">نسخ الـ Hash بعد كل عملية ناجحة</div></div>
          <Toggle on={draft.autoCopyTx} onChange={(v) => set('autoCopyTx', v)} />
        </div>
      </div>

      <aside className="side-col">
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="eye" size={15} className="green" /> المعاينة</h4>
          <KV k="مبلغ" v={draft.compactValues ? '1.25M وحدة' : '1,250,000 وحدة'} />
          <KV k="التاريخ" v="2026-08-17 15:10" />
          <KV k="المنطقة" v={draft.timezone} />
          <KV k="اللغة" v={draft.language} />
        </div>
      </aside>
    </div>
  );
}

/* ---------------- الأمان ---------------- */
function SecurityTab({ draft, set }: { draft: AppSettings; set: SetFn }) {
  const { go, toast } = useApp();
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [cf, setCf] = useState('');
  const [endAllOpen, setEndAllOpen] = useState(false);
  const st = pinStrength(nw);
  const mismatch = cf.length > 0 && nw !== cf;

  const changePin = () => {
    if (!cur) return toast('error', 'أدخل رمز الحماية الحالي');
    if (nw.length < 6) return toast('error', 'الرمز الجديد قصير جدًا');
    if (mismatch) return toast('error', 'الرمز الجديد غير مطابق');
    setCur(''); setNw(''); setCf('');
    toast('success', 'تم تغيير رمز الحماية ✅');
  };

  return (
    <div className="content-grid">
      <div>
        <div className="card mb">
          <h4 className="card-title h4"><Icon name="key" size={15} className="green" /> تغيير رمز الحماية</h4>
          <Field label="رمز الحماية الحالي" required>
            <input className="input" type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="••••••••" />
          </Field>
          <div className="grid-2">
            <Field label="رمز الحماية الجديد" required>
              <input className={`input ${nw && nw.length < 6 ? 'invalid' : nw ? 'valid' : ''}`} type="password" value={nw} onChange={(e) => setNw(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="تأكيد الرمز الجديد" required error={mismatch ? 'الرمزان غير متطابقين' : null}>
              <input className={`input ${mismatch ? 'invalid' : cf && !mismatch ? 'valid' : ''}`} type="password" value={cf} onChange={(e) => setCf(e.target.value)} placeholder="••••••••" />
            </Field>
          </div>
          {nw && (
            <div className="strength mb">
              <div className={`strength-bar ${st.cls}`}><i style={{ width: `${(st.score / 5) * 100}%` }} /></div>
              <span className={`tiny bold ${st.cls === 'good' ? 'green' : st.cls === 'mid' ? 'yellow' : 'red'}`}>{st.label}</span>
            </div>
          )}
          <button type="button" className="btn btn-primary" onClick={changePin}>
            <Icon name="refresh" size={15} /> تغيير رمز الحماية
          </button>
        </div>

        <div className="card">
          <h4 className="card-title h4"><Icon name="shield" size={15} className="green" /> حماية الجلسة</h4>
          <div className="switch-row">
            <div><b className="small">تفعيل التحقق بخطوتين</b><div className="tiny faint">طلب رمز مؤقت عند كل دخول</div></div>
            <Toggle on={draft.twoFactor} onChange={(v) => set('twoFactor', v)} />
          </div>
          <div className="switch-row">
            <div><b className="small">القفل التلقائي عند الخمول</b><div className="tiny faint">قفل النظام تلقائيًا عند عدم النشاط</div></div>
            <Toggle on={draft.autoLock} onChange={(v) => set('autoLock', v)} />
          </div>
          <Field label="مدة القفل التلقائي">
            <select className="input" disabled={!draft.autoLock} value={draft.autoLockMinutes} onChange={(e) => set('autoLockMinutes', e.target.value)}>
              {['5 دقائق', '15 دقيقة', '30 دقيقة', 'ساعة'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <div className="switch-row">
            <div><b className="small">طلب رمز الحماية قبل العمليات الحساسة</b><div className="tiny faint">السك، الإرسال، حذف المحافظ</div></div>
            <Toggle on={draft.pinBeforeSensitive} onChange={(v) => set('pinBeforeSensitive', v)} />
          </div>
        </div>
      </div>

      <aside className="side-col">
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="users" size={15} className="green" /> الجلسات</h4>
          <p className="muted small mb-sm">راجع الأجهزة المتصلة وأنهِ أي جلسة غير معروفة.</p>
          <button type="button" className="btn btn-sm btn-outline btn-block mb-sm" onClick={() => go('sessions')}>عرض الجلسات النشطة</button>
          <button type="button" className="btn btn-sm btn-danger btn-block" onClick={() => setEndAllOpen(true)}>إنهاء كل الجلسات</button>
        </div>
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> سجل الأمان</h4>
          <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('activity')}>فتح سجل النشاط</button>
        </div>
      </aside>

      <ConfirmModal open={endAllOpen} onClose={() => setEndAllOpen(false)} onConfirm={() => { setEndAllOpen(false); toast('success', 'تم إنهاء جميع الجلسات الأخرى ✅'); }} title="إنهاء كل الجلسات؟" confirmLabel="نعم، إنهاء الجلسات" danger body={<p className="muted small">سيتم تسجيل الخروج من كل الأجهزة عدا الجهاز الحالي.</p>} />
    </div>
  );
}

/* ---------------- الحدود والترخيص ---------------- */
function LimitsTab({ draft, set }: { draft: AppSettings; set: SetFn }) {
  const used = 125_000;
  const pct = Math.min(100, (used / draft.dailySendLimit) * 100);
  return (
    <div className="content-grid">
      <div className="card">
        <h4 className="card-title h4"><Icon name="scale" size={15} className="green" /> حدود التشغيل</h4>
        <div className="grid-2">
          <Field label="الحد اليومي للإرسال" hint="بالوحدات">
            <input className="input" type="number" value={draft.dailySendLimit} onChange={(e) => set('dailySendLimit', Number(e.target.value))} />
          </Field>
          <Field label="الحد اليومي للسك" hint="بالوحدات">
            <input className="input" type="number" value={draft.dailyMintLimit} onChange={(e) => set('dailyMintLimit', Number(e.target.value))} />
          </Field>
          <Field label="الحد الأقصى للعملية الواحدة">
            <input className="input" type="number" value={draft.maxPerOperation} onChange={(e) => set('maxPerOperation', Number(e.target.value))} />
          </Field>
          <Field label="أقصى عدد مستلمين في التنفيذ الجماعي">
            <input className="input" type="number" value={draft.maxRecipients} onChange={(e) => set('maxRecipients', Number(e.target.value))} />
          </Field>
        </div>

        <div className="modal-sep" />
        <div className="switch-row">
          <div><b className="small">تنبيه اقتراب الحد</b><div className="tiny faint">إظهار تحذير عند بلوغ نسبة محددة</div></div>
          <Toggle on={draft.limitAlert} onChange={(v) => set('limitAlert', v)} />
        </div>
        <div className="grid-2">
          <Field label="نسبة تنبيه اقتراب الحد">
            <div className="input-wrap">
              <input className="input" type="number" min={10} max={99} disabled={!draft.limitAlert} value={draft.limitAlertPct} onChange={(e) => set('limitAlertPct', Number(e.target.value))} />
              <span className="input-suffix">%</span>
            </div>
          </Field>
          <Field label="موعد إعادة ضبط الحد اليومي">
            <input className="input" type="time" value={draft.resetTime} onChange={(e) => set('resetTime', e.target.value)} />
          </Field>
        </div>
      </div>

      <aside className="side-col">
        <div className="card">
          <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> الاستهلاك الحالي</h4>
          <KV k="المستهلك اليوم" v={`${fmt(used)} وحدة`} />
          <KV k="الحد اليومي" v={`${fmt(draft.dailySendLimit)} وحدة`} />
          <KV k="المتبقي" v={`${fmt(Math.max(0, draft.dailySendLimit - used))} وحدة`} tone="green" />
          <div className="mt-sm"><ProgressBar pct={pct} /></div>
          <div className="tiny faint mt-sm">{pct.toFixed(1)}% من الحد اليومي · يُعاد الضبط عند {draft.resetTime}</div>
          {draft.limitAlert && pct >= draft.limitAlertPct && (
            <div className="warn-strip mt-sm"><Icon name="warning" size={14} /> اقتربت من الحد اليومي</div>
          )}
        </div>
        <div className="info-strip">
          <Icon name="info" size={15} /> عند تجاوز الحد تُرفض العملية تلقائيًا مع رسالة تجاوز الحد اليومي.
        </div>
      </aside>
    </div>
  );
}

/* ---------------- الإشعارات ---------------- */
function NotifTab({ draft, set }: { draft: AppSettings; set: SetFn }) {
  const { go } = useApp();
  const rows: { k: keyof AppSettings; label: string; hint: string }[] = [
    { k: 'notifMint', label: 'إشعارات اكتمال السك', hint: 'عند نجاح عملية سك فردية أو جماعية' },
    { k: 'notifSend', label: 'إشعارات اكتمال الإرسال', hint: 'عند اكتمال الإرسال المنفرد أو الجماعي' },
    { k: 'notifDeploy', label: 'إشعارات نتيجة النشر', hint: 'نجاح أو فشل نشر العقود' },
    { k: 'notifLimit', label: 'إشعارات تحذير الحد اليومي', hint: 'عند الاقتراب من الحد أو تجاوزه' },
    { k: 'notifNetwork', label: 'إشعارات حالة الشبكة', hint: 'الازدحام وانقطاع نقاط الاتصال' },
    { k: 'notifFail', label: 'إشعارات فشل العمليات', hint: 'أي عملية تنتهي بالفشل' },
  ];
  return (
    <div className="content-grid">
      <div className="card">
        <h4 className="card-title h4"><Icon name="bell" size={15} className="green" /> أنواع الإشعارات</h4>
        {rows.map((r) => (
          <div key={r.k} className="switch-row">
            <div><b className="small">{r.label}</b><div className="tiny faint">{r.hint}</div></div>
            <Toggle on={draft[r.k] as boolean} onChange={(v) => set(r.k, v as never)} />
          </div>
        ))}
        <div className="modal-sep" />
        <div className="grid-2">
          <Field label="مدة بقاء الرسائل العائمة">
            <select className="input" value={draft.toastDuration} onChange={(e) => set('toastDuration', e.target.value)}>
              {['2 ثانية', '3 ثوانٍ', '5 ثوانٍ', '8 ثوانٍ'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div className="switch-row">
          <div><b className="small">تجميع الإشعارات المتكررة</b><div className="tiny faint">دمج الإشعارات المتشابهة في إشعار واحد</div></div>
          <Toggle on={draft.groupRepeats} onChange={(v) => set('groupRepeats', v)} />
        </div>
      </div>

      <aside className="side-col">
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="bell" size={15} className="green" /> مركز الإشعارات</h4>
          <p className="muted small mb-sm">استعرض كل الإشعارات وعلّمها كمقروءة.</p>
          <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('notifications')}>فتح مركز الإشعارات</button>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- النسخ الاحتياطي ---------------- */
function BackupTab({ draft, set, onNotify }: { draft: AppSettings; set: SetFn; onNotify: (n: { kind: 'deploy'; title: string; body: string; target: string }) => void }) {
  const { toast } = useApp();
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [file, setFile] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [log, setLog] = useState(BACKUP_LOG);

  const createBackup = () => {
    if (pass.length < 6) return toast('error', 'كلمة حماية النسخة يجب ألا تقل عن 6 خانات');
    setBusy(true);
    setPct(0);
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(t);
          setBusy(false);
          downloadFile('token-studio-backup.json', JSON.stringify({ createdAt: new Date().toISOString(), encrypted: true, includes: { addressBook: draft.backupAddressBook, settings: draft.backupSettings } }, null, 2), 'application/json');
          setLog((l) => [{ id: 'b' + Date.now(), time: new Date().toISOString().slice(0, 16).replace('T', ' '), kind: 'إنشاء نسخة', size: '49 كيلوبايت', result: 'ناجحة' }, ...l]);
          toast('success', 'تم إنشاء النسخة الاحتياطية ✅');
          onNotify({ kind: 'deploy', title: 'اكتملت النسخة الاحتياطية', body: 'أُنشئت نسخة احتياطية مشفَّرة وتم تنزيلها.', target: 'settings' });
          return 100;
        }
        return p + 10;
      });
    }, 120);
  };

  return (
    <div className="content-grid">
      <div>
        <div className="card mb">
          <h4 className="card-title h4"><Icon name="download" size={15} className="green" /> إنشاء نسخة احتياطية</h4>
          <Field label="كلمة حماية النسخة الاحتياطية" required hint="ستحتاجها عند الاستعادة — احفظها في مكان آمن">
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          </Field>
          <div className="switch-row">
            <div><b className="small">تضمين دفتر العناوين</b></div>
            <Toggle on={draft.backupAddressBook} onChange={(v) => set('backupAddressBook', v)} />
          </div>
          <div className="switch-row">
            <div><b className="small">تضمين إعدادات النظام</b></div>
            <Toggle on={draft.backupSettings} onChange={(v) => set('backupSettings', v)} />
          </div>
          {busy && <div className="mt-sm"><ProgressBar pct={pct} /><div className="tiny faint mt-sm">جارٍ إنشاء النسخة... {pct}%</div></div>}
          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary" onClick={createBackup} disabled={busy}>
              {busy ? <span className="spin" /> : <Icon name="download" size={15} />} إنشاء نسخة احتياطية
            </button>
            <Field label="">
              <select className="input compact" value={draft.exportFormat} onChange={(e) => set('exportFormat', e.target.value)}>
                {['JSON', 'CSV', 'ZIP'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="card">
          <h4 className="card-title h4"><Icon name="refresh" size={15} className="green" /> استعادة نسخة احتياطية</h4>
          <div className="warn-strip mb"><Icon name="warning" size={15} /> الاستعادة تستبدل البيانات الحالية بالكامل</div>
          <FileDrop accept=".json,.bak" hint="ملف نسخة احتياطية مشفَّر" fileName={file} onFile={(name) => setFile(name)} />
          <button type="button" className="btn btn-outline btn-block mt" disabled={!file} onClick={() => setRestoreOpen(true)}>
            <Icon name="refresh" size={15} /> استعادة النسخة
          </button>
        </div>
      </div>

      <aside className="side-col">
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> آخر نسخة احتياطية</h4>
          <KV k="التاريخ" v={log[0]?.time ?? '—'} />
          <KV k="الحجم" v={log[0]?.size ?? '—'} />
          <KV k="النتيجة" v={<span className="green bold">{log[0]?.result ?? '—'}</span>} />
        </div>
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="file" size={15} className="green" /> سجل العمليات</h4>
          <div className="timeline">
            {log.map((b) => (
              <div key={b.id} className="tl-item">
                <span className="tl-dot green" />
                <div><b className="small">{b.kind}</b><div className="tiny faint">{b.time} · {b.size}</div></div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <ConfirmModal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        onConfirm={() => {
          setRestoreOpen(false);
          toast('success', 'تمت استعادة النسخة الاحتياطية ✅');
          setLog((l) => [{ id: 'b' + Date.now(), time: new Date().toISOString().slice(0, 16).replace('T', ' '), kind: 'استعادة نسخة', size: '47 كيلوبايت', result: 'ناجحة' }, ...l]);
        }}
        title="تأكيد الاستعادة"
        confirmLabel="نعم، استعادة الآن"
        danger
        body={<p className="muted small">سيتم استبدال دفتر العناوين والإعدادات الحالية ببيانات الملف <b>{file}</b>. لا يمكن التراجع.</p>}
      />
    </div>
  );
}

/* ---------------- حول النظام ---------------- */
function AboutTab() {
  const { go, toast } = useApp();
  const [checking, setChecking] = useState(false);
  const [upToDate, setUpToDate] = useState<boolean | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  return (
    <div className="content-grid">
      <div className="card">
        <div className="about-head">
          <div className="logo-mark lg">T</div>
          <div>
            <h3 style={{ fontSize: 18 }}>{SYSTEM_INFO.name}</h3>
            <span className="badge green">{SYSTEM_INFO.version}</span>
          </div>
        </div>
        <div className="modal-sep" />
        <KV k="رقم البناء" v={SYSTEM_INFO.build} mono />
        <KV k="تاريخ آخر تحديث" v={SYSTEM_INFO.lastUpdate} />
        <KV k="محرك التشغيل" v={SYSTEM_INFO.engine} />
        <KV k="معرّف التثبيت" v={<span className="row" style={{ gap: 6 }}><span className="mono-cell">{PROFILE.installId}</span><CopyBtn text={PROFILE.installId} small /></span>} />

        <div className="modal-sep" />
        <div className="row" style={{ gap: 9, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={checking}
            onClick={() => { setChecking(true); setTimeout(() => { setChecking(false); setUpToDate(true); toast('success', 'النظام محدَّث لآخر إصدار ✅'); }, 1200); }}
          >
            {checking ? <><span className="spin" /> جارٍ الفحص...</> : <><Icon name="refresh" size={14} /> فحص وجود تحديث</>}
          </button>
          {checking && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setChecking(false)}>إلغاء الفحص</button>}
          <button type="button" className="btn btn-sm btn-outline" onClick={() => { downloadFile('system-info.json', JSON.stringify(SYSTEM_INFO, null, 2), 'application/json'); toast('success', 'تم حفظ بيانات النظام'); }}>
            <Icon name="download" size={14} /> حفظ بيانات النظام
          </button>
        </div>
        {upToDate && <div className="info-strip mt"><Icon name="check" size={15} /> أنت تستخدم أحدث إصدار متاح.</div>}
      </div>

      <aside className="side-col">
        <div className="card tight">
          <h4 className="card-title h4"><Icon name="book" size={15} className="green" /> الوثائق والروابط</h4>
          <button type="button" className="link-row" onClick={() => go('terms')}><Icon name="file" size={15} /> شروط الاستخدام <Icon name="chevLeft" size={14} /></button>
          <button type="button" className="link-row" onClick={() => go('policies')}><Icon name="shield" size={15} /> سياسات الاستخدام <Icon name="chevLeft" size={14} /></button>
          <button type="button" className="link-row" onClick={() => go('help')}><Icon name="info" size={15} /> مركز المساعدة <Icon name="chevLeft" size={14} /></button>
          <button type="button" className="link-row" onClick={() => setDocOpen(true)}><Icon name="check" size={15} /> تأكيد قراءة الشروط <Icon name="chevLeft" size={14} /></button>
        </div>
        <div className="card tight center">
          <p className="tiny faint">© 2026 استوديو التوكن — جميع الحقوق محفوظة</p>
          <p className="tiny faint">عرض تجريبي — كل العمليات محاكاة داخل المتصفح</p>
        </div>
      </aside>

      <Modal open={docOpen} onClose={() => setDocOpen(false)} size="sm" title="تأكيد قراءة الشروط">
        <p className="muted small mb">بالضغط على تأكيد فإنك تقر بأنك قرأت شروط الاستخدام وسياسات النظام ووافقت عليها.</p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => { setDocOpen(false); toast('success', 'تم تسجيل تأكيد القراءة ✅'); }}>تأكيد</button>
      </Modal>
    </div>
  );
}
