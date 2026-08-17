import { useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, Field, UnsavedBar, KV, EmptyState } from '../../components/ui/shared';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { CopyBtn } from '../../components/ui/primitives';
import { validateAddress, shortAddr } from '../../lib/format';
import { TRANSACTIONS } from '../../data/mock';

const NETS = ['TRC20', 'ERC20', 'BEP20'];
const NET_TO_CHAIN: Record<string, string> = { TRC20: 'TRON', ERC20: 'ETH', BEP20: 'BSC' };

function useAddrForm(initial: { name: string; addr: string; net: string; note: string }) {
  const [name, setName] = useState(initial.name);
  const [addr, setAddr] = useState(initial.addr);
  const [net, setNet] = useState(initial.net);
  const [note, setNote] = useState(initial.note);
  const [dirty, setDirty] = useState(false);
  return { name, setName, addr, setAddr, net, setNet, note, setNote, dirty, setDirty };
}

/* ============================================================
   شاشة إنشاء جهة عنوان — SCR-ADDR-CREATE
   ============================================================ */
export function AddressCreate() {
  const { addresses, setAddresses, go, toast } = useApp();
  const f = useAddrForm({ name: '', addr: '', net: 'TRC20', note: '' });
  const [touched, setTouched] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discard, setDiscard] = useState(false);

  const addrValid = validateAddress(f.addr, NET_TO_CHAIN[f.net] === 'TRON' ? 'TRON' : 'EVM');
  const duplicate = addresses.some((a) => a.addr.toLowerCase() === f.addr.trim().toLowerCase());
  const errName = !f.name.trim() ? 'اسم جهة العنوان مطلوب' : null;
  const errAddr = !f.addr.trim() ? 'عنوان المحفظة مطلوب' : !addrValid ? 'صيغة العنوان غير صحيحة لهذه الشبكة' : duplicate ? 'هذا العنوان موجود مسبقًا في دفتر العناوين' : null;

  const save = () => {
    setTouched(true);
    if (errName || errAddr) {
      toast('error', 'تحقق من الحقول قبل الحفظ');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setAddresses((list) => [
        ...list,
        {
          id: 'ab' + Date.now(),
          name: f.name.trim(),
          addr: f.addr.trim(),
          short: shortAddr(f.addr.trim()),
          net: f.net,
          note: f.note.trim(),
          lastUsed: 'لم يُستخدم',
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      setSaving(false);
      toast('success', 'تم حفظ جهة العنوان ✅');
      go('address-book');
    }, 700);
  };

  return (
    <div style={{ paddingBottom: f.dirty ? 70 : 0 }}>
      <Breadcrumb items={[{ label: 'دفتر العناوين', to: 'address-book' }, { label: 'إنشاء جهة عنوان' }]} />
      <PageHead title="إنشاء جهة عنوان" sub="أضف عنوانًا موثوقًا لتسريع الإرسال" backTo="address-book" />

      <div className="content-grid">
        <div className="card">
          <Field label="اسم جهة العنوان" required error={touched ? errName : null}>
            <input className={`input ${touched && errName ? 'invalid' : f.name ? 'valid' : ''}`} value={f.name} onChange={(e) => { f.setName(e.target.value); f.setDirty(true); }} placeholder="مثال: العميل_04" />
          </Field>

          <Field label="عنوان المحفظة" required error={touched ? errAddr : null} ok={addrValid && !duplicate ? 'عنوان صالح ✓' : null}>
            <div className="input-wrap">
              <input
                className={`input mono ${touched && errAddr ? 'invalid' : addrValid && !duplicate ? 'valid' : ''}`}
                value={f.addr}
                onChange={(e) => { f.setAddr(e.target.value); f.setDirty(true); }}
                placeholder={f.net === 'TRC20' ? 'T...' : '0x...'}
              />
              <div className="input-icons">
                <button type="button" aria-label="لصق" onClick={async () => {
                  try { const t = await navigator.clipboard.readText(); f.setAddr(t); f.setDirty(true); toast('success', 'تم اللصق من الحافظة'); }
                  catch { toast('error', 'تعذر القراءة من الحافظة'); }
                }}><Icon name="paste" size={15} /></button>
                <button type="button" aria-label="مسح رمز" onClick={() => setQrOpen(true)}><Icon name="qr" size={15} /></button>
              </div>
            </div>
          </Field>

          <Field label="شبكة جهة العنوان" required>
            <select className="input" value={f.net} onChange={(e) => { f.setNet(e.target.value); f.setDirty(true); }}>
              {NETS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>

          <Field label="وصف جهة العنوان" hint="اختياري — ملاحظة داخلية للتذكير">
            <textarea className="input" rows={3} value={f.note} onChange={(e) => { f.setNote(e.target.value); f.setDirty(true); }} placeholder="مثال: عميل شهري — تحويلات نهاية الأسبوع" />
          </Field>

          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary grow" onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : <Icon name="check" size={15} />} حفظ جهة العنوان
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => (f.dirty ? setDiscard(true) : go('address-book'))}>
              إلغاء
            </button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="eye" size={15} className="green" /> المعاينة</h4>
            <div className="list-row" style={{ borderBottom: 'none' }}>
              <span className="avatar-circle">{(f.name || '؟؟').slice(0, 2)}</span>
              <div style={{ minWidth: 0 }}>
                <b className="small">{f.name || 'اسم جهة العنوان'}</b>
                <div className="mono tiny faint">{f.addr ? shortAddr(f.addr, 10, 6) : '—'}</div>
              </div>
            </div>
            <KV k="الشبكة" v={<span className={`badge ${f.net.toLowerCase()}`}>{f.net}</span>} />
            <KV k="حالة العنوان" v={addrValid ? <span className="green bold">صالح</span> : <span className="red bold">غير صالح</span>} />
          </div>

          <div className="info-strip">
            <Icon name="info" size={15} /> تأكد من مطابقة الشبكة للعنوان — الإرسال لشبكة خاطئة يفقد الأموال.
          </div>
        </aside>
      </div>

      <UnsavedBar show={f.dirty} onSave={save} onCancel={() => setDiscard(true)} saving={saving} />

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="ماسح رمز الاستجابة">
        <div className="qr-box mb"><div className="qr-frame" /></div>
        <p className="center muted small mb">وجّه الكاميرا نحو رمز الاستجابة الخاص بالعنوان</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            f.setAddr('TQx7kR8vPm2nLq4wXz9bCdEfGhIjKlMn');
            f.setDirty(true);
            setQrOpen(false);
            toast('success', 'تم قراءة العنوان من الرمز ✅');
          }}
        >
          محاكاة قراءة الرمز
        </button>
      </Modal>

      <ConfirmModal
        open={discard}
        onClose={() => setDiscard(false)}
        onConfirm={() => { setDiscard(false); go('address-book'); }}
        title="إلغاء الإنشاء؟"
        confirmLabel="نعم، إلغاء"
        danger
        body={<p className="muted small">ستفقد البيانات التي أدخلتها.</p>}
      />
    </div>
  );
}

/* ============================================================
   شاشة تعديل جهة عنوان — SCR-ADDR-EDIT
   ============================================================ */
export function AddressEdit() {
  const { params, addresses, setAddresses, go, toast } = useApp();
  const entry = addresses.find((a) => a.id === params.addressId) ?? addresses[0];
  const f = useAddrForm({ name: entry?.name ?? '', addr: entry?.addr ?? '', net: entry?.net ?? 'TRC20', note: entry?.note ?? '' });
  const [saving, setSaving] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  if (!entry) {
    return <EmptyState icon="book" title="جهة العنوان غير موجودة" actionLabel="العودة لدفتر العناوين" onAction={() => go('address-book')} />;
  }

  const addrValid = validateAddress(f.addr, NET_TO_CHAIN[f.net] === 'TRON' ? 'TRON' : 'EVM');
  const errAddr = !addrValid ? 'صيغة العنوان غير صحيحة لهذه الشبكة' : null;

  const save = () => {
    if (!f.name.trim() || errAddr) {
      toast('error', 'تحقق من الحقول قبل الحفظ');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setAddresses((list) =>
        list.map((a) => (a.id === entry.id ? { ...a, name: f.name.trim(), addr: f.addr.trim(), short: shortAddr(f.addr.trim()), net: f.net, note: f.note.trim() } : a)),
      );
      setSaving(false);
      f.setDirty(false);
      toast('success', 'تم حفظ التعديلات ✅');
      go('address-book');
    }, 700);
  };

  const related = TRANSACTIONS.slice(0, 3);

  return (
    <div style={{ paddingBottom: f.dirty ? 70 : 0 }}>
      <Breadcrumb items={[{ label: 'دفتر العناوين', to: 'address-book' }, { label: 'تعديل جهة عنوان' }]} />
      <PageHead
        title="تعديل جهة عنوان"
        sub={entry.name}
        backTo="address-book"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => go('send', { prefillAddr: entry.addr })}>
              <Icon name="send" size={14} /> إرسال إلى هذا العنوان
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setDelOpen(true)}>
              <Icon name="trash" size={14} /> حذف
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div className="card">
          <Field label="اسم جهة العنوان" required error={!f.name.trim() ? 'الاسم مطلوب' : null}>
            <input className="input" value={f.name} onChange={(e) => { f.setName(e.target.value); f.setDirty(true); }} />
          </Field>
          <Field label="عنوان المحفظة" required error={errAddr} ok={addrValid ? 'عنوان صالح ✓' : null}>
            <div className="input-wrap">
              <input className={`input mono ${errAddr ? 'invalid' : 'valid'}`} value={f.addr} onChange={(e) => { f.setAddr(e.target.value); f.setDirty(true); }} />
              <div className="input-icons">
                <button type="button" aria-label="نسخ" onClick={() => { navigator.clipboard?.writeText(f.addr); toast('success', 'تم نسخ العنوان ✅'); }}>
                  <Icon name="copy" size={15} />
                </button>
              </div>
            </div>
          </Field>
          <Field label="شبكة جهة العنوان" required>
            <select className="input" value={f.net} onChange={(e) => { f.setNet(e.target.value); f.setDirty(true); }}>
              {NETS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="وصف جهة العنوان">
            <textarea className="input" rows={3} value={f.note} onChange={(e) => { f.setNote(e.target.value); f.setDirty(true); }} />
          </Field>

          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary grow" onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : <Icon name="check" size={15} />} حفظ التعديلات
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => (f.dirty ? setDiscard(true) : go('address-book'))}>إلغاء</button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> بيانات الجهة</h4>
            <KV k="أضيفت في" v={entry.createdAt} />
            <KV k="آخر استخدام" v={entry.lastUsed} />
            <KV k="الشبكة" v={<span className={`badge ${entry.net.toLowerCase()}`}>{entry.net}</span>} />
            <div className="modal-sep" />
            <CopyBtn text={entry.addr} label="نسخ العنوان" />
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> آخر المعاملات مع الجهة</h4>
            <div className="timeline">
              {related.map((t) => (
                <div key={t.id} className="tl-item">
                  <span className={`tl-dot ${t.status === 'success' ? 'green' : t.status === 'pending' ? 'yellow' : 'red'}`} />
                  <div>
                    <b className="small">{t.type === 'mint' ? 'سك' : t.type === 'send' ? 'إرسال' : 'حرق'} — {t.amount.toLocaleString('en-US')}</b>
                    <div className="tiny faint">{t.date} · {t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <UnsavedBar show={f.dirty} onSave={save} onCancel={() => setDiscard(true)} saving={saving} />

      <ConfirmModal open={discard} onClose={() => setDiscard(false)} onConfirm={() => { setDiscard(false); go('address-book'); }} title="إلغاء التعديلات؟" confirmLabel="نعم، إلغاء" danger body={<p className="muted small">ستفقد التغييرات غير المحفوظة.</p>} />
      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={() => { setAddresses((l) => l.filter((x) => x.id !== entry.id)); setDelOpen(false); toast('success', 'تم حذف جهة العنوان ✅'); go('address-book'); }}
        title="حذف جهة العنوان؟"
        confirmLabel="نعم، حذف"
        danger
        body={<p className="muted small">سيتم حذف <b>{entry.name}</b> نهائيًا.</p>}
      />
    </div>
  );
}
