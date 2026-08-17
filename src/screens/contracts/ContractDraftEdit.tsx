import { useEffect, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, Field, UnsavedBar, KV, EmptyState } from '../../components/ui/shared';
import { ConfirmModal } from '../../components/ui/Modal';
import { fmt, parseAmount } from '../../lib/format';

const TEMPLATES = ['النسخة الأساسية', 'المتقدم بالسك والحرق', 'كامل المميزات', 'القابل للترقية'];

/* شاشة تعديل مسودة العقد — SCR-CONT-DRAFT-EDIT */
export function ContractDraftEdit() {
  const { params, contracts, setContracts, go, toast } = useApp();
  const draft = contracts.find((c) => c.id === params.contractId) ?? contracts.find((c) => c.status === 'draft');

  const [name, setName] = useState(draft?.name ?? '');
  const [tokenName, setTokenName] = useState(draft?.name.replace('مسودة — ', '') ?? '');
  const [symbol, setSymbol] = useState(draft?.symbol ?? '');
  const [supply, setSupply] = useState(draft ? fmt(draft.supply) : '');
  const [template, setTemplate] = useState(draft?.template ?? TEMPLATES[0]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(draft?.updatedAt ?? '—');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => { setDirty(false); }, [params.contractId]);

  if (!draft) {
    return <EmptyState icon="file" title="لا توجد مسودة" hint="أنشئ عقدًا جديدًا للبدء." actionLabel="إنشاء عقد جديد" onAction={() => go('engine')} />;
  }

  const touch = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true); };

  const errName = !tokenName.trim() ? 'اسم التوكن مطلوب' : null;
  const errSymbol = !symbol.trim() ? 'رمز التوكن مطلوب' : symbol.length > 8 ? 'الرمز يجب ألا يتجاوز 8 أحرف' : null;
  const errSupply = parseAmount(supply) <= 0 ? 'العرض الأولي يجب أن يكون أكبر من صفر' : null;

  const save = () => {
    if (errName || errSymbol || errSupply) {
      toast('error', 'تحقق من الحقول المطلوبة');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setContracts((list) =>
        list.map((c) =>
          c.id === draft.id
            ? { ...c, name, symbol, supply: parseAmount(supply), template, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
            : c,
        ),
      );
      setSaving(false);
      setDirty(false);
      setLastSaved(new Date().toISOString().slice(0, 16).replace('T', ' '));
      toast('success', 'تم حفظ تعديلات المسودة ✅');
    }, 800);
  };

  const reset = () => {
    setName(draft.name);
    setTokenName(draft.name.replace('مسودة — ', ''));
    setSymbol(draft.symbol);
    setSupply(fmt(draft.supply));
    setTemplate(draft.template);
    setDirty(false);
    setDiscardOpen(false);
    toast('info', 'أُلغيت التعديلات');
  };

  return (
    <div style={{ paddingBottom: dirty ? 70 : 0 }}>
      <Breadcrumb items={[{ label: 'محرك العقود', to: 'contracts' }, { label: 'تعديل المسودة' }]} />
      <PageHead
        title="تعديل مسودة العقد"
        sub={`آخر حفظ: ${lastSaved}`}
        backTo="contracts"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setDelOpen(true)}>
              <Icon name="trash" size={14} /> حذف المسودة
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : <Icon name="check" size={14} />} حفظ
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div className="card">
          <h4 className="card-title h4"><Icon name="edit" size={15} className="green" /> بيانات المسودة</h4>

          <Field label="اسم المسودة" required>
            <input className="input" value={name} onChange={(e) => touch(setName)(e.target.value)} />
          </Field>

          <div className="grid-2">
            <Field label="اسم التوكن" required error={dirty ? errName : null}>
              <input className={`input ${dirty && errName ? 'invalid' : tokenName ? 'valid' : ''}`} value={tokenName} onChange={(e) => touch(setTokenName)(e.target.value)} />
            </Field>
            <Field label="رمز التوكن" required error={dirty ? errSymbol : null}>
              <input className={`input mono ${dirty && errSymbol ? 'invalid' : symbol ? 'valid' : ''}`} value={symbol} onChange={(e) => touch(setSymbol)(e.target.value.toUpperCase())} maxLength={8} />
            </Field>
          </div>

          <Field label="العرض الأولي" required error={dirty ? errSupply : null} hint="عدد الوحدات المُصدَرة عند النشر">
            <div className="input-wrap">
              <input className={`input ${dirty && errSupply ? 'invalid' : ''}`} value={supply} onChange={(e) => touch(setSupply)(e.target.value)} />
              <span className="input-suffix">وحدة</span>
            </div>
          </Field>

          <Field label="القالب المختار">
            <select className="input" value={template} onChange={(e) => touch(setTemplate)(e.target.value)}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary grow" onClick={() => { save(); go('engine'); }}>
              متابعة إلى التكوين <Icon name="arrowLeft" size={15} />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => (dirty ? setDiscardOpen(true) : go('contracts'))}>
              إلغاء
            </button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> حالة المسودة</h4>
            <KV k="الحالة" v={<span className="badge gray">مسودة</span>} />
            <KV k="الشبكة" v={<span className={`badge ${draft.netBadge.toLowerCase()}`}>{draft.netBadge}</span>} />
            <KV k="الخانات العشرية" v={draft.decimals} />
            <KV k="أنشئت في" v={draft.createdAt} />
            <KV k="آخر حفظ" v={lastSaved} />
            <div className="modal-sep" />
            <div className={`small bold ${dirty ? 'yellow' : 'green'}`}>
              <Icon name={dirty ? 'warning' : 'check'} size={13} /> {dirty ? 'توجد تعديلات غير محفوظة' : 'كل التعديلات محفوظة'}
            </div>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> المعاينة</h4>
            <div className="preview-token">
              <span className="entity-icon lg">{(symbol || '؟').slice(0, 2)}</span>
              <b>{tokenName || 'اسم التوكن'}</b>
              <span className="tiny faint">{symbol || 'SYMBOL'} · {draft.decimals} خانة</span>
              <span className="small green bold">{supply || '0'} وحدة</span>
            </div>
          </div>
        </aside>
      </div>

      <UnsavedBar show={dirty} onSave={save} onCancel={() => setDiscardOpen(true)} saving={saving} />

      <ConfirmModal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={reset}
        title="إلغاء التعديلات غير المحفوظة؟"
        confirmLabel="نعم، إلغاء التعديلات"
        danger
        body={<p className="muted small">ستفقد جميع التغييرات التي أجريتها على هذه المسودة.</p>}
      />

      <ConfirmModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={() => {
          setContracts((list) => list.filter((c) => c.id !== draft.id));
          setDelOpen(false);
          toast('success', 'تم حذف المسودة ✅');
          go('contracts');
        }}
        title="حذف المسودة؟"
        confirmLabel="نعم، حذف"
        danger
        body={<p className="muted small">سيتم حذف المسودة نهائيًا ولا يمكن التراجع.</p>}
      />
    </div>
  );
}
