import { useMemo, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { PageHead, EmptyState, ContextMenu, MenuButton, SkeletonList, StatusBadge } from '../../components/ui/shared';
import { ConfirmModal } from '../../components/ui/Modal';
import { fmt, shortAddr } from '../../lib/format';
import { CopyBtn } from '../../components/ui/primitives';

const SORTS = [
  { id: 'newest', label: 'الأحدث أولًا' },
  { id: 'oldest', label: 'الأقدم أولًا' },
  { id: 'name', label: 'الاسم أبجديًا' },
];

/* شاشة قائمة العقود — SCR-CONT-LIST */
export function ContractsList() {
  const { contracts, setContracts, go, toast, setActiveContractId } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('الكل');
  const [net, setNet] = useState('الكل');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [delTarget, setDelTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = contracts.filter((c) => {
      if (status !== 'الكل') {
        const map: Record<string, string> = { منشور: 'published', موثّق: 'verified', مسودة: 'draft' };
        if (c.status !== map[status]) return false;
      }
      if (net !== 'الكل' && c.network !== net) return false;
      if (q && !`${c.name} ${c.symbol} ${c.address}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [contracts, q, status, net, sort]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast('success', 'تم تحديث قائمة العقود'); }, 800);
  };

  const remove = () => {
    const c = contracts.find((x) => x.id === delTarget);
    setContracts((list) => list.filter((x) => x.id !== delTarget));
    setDelTarget(null);
    toast('success', `تم حذف المسودة ${c?.name ?? ''} ✅`);
  };

  const hasAny = contracts.length > 0;

  return (
    <div>
      <PageHead
        title="محرك العقود"
        sub="العقود المنشأة والمسودات"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={refresh} disabled={loading}>
              {loading ? <span className="spin" /> : <Icon name="refresh" size={14} />} تحديث
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go('engine')}>
              <Icon name="plus" size={14} strokeWidth={3} /> إنشاء عقد جديد
            </button>
          </>
        }
      />

      <div className="toolbar">
        <div className="input-wrap grow" style={{ maxWidth: 340 }}>
          <input className="input" placeholder="البحث باسم العقد أو عنوانه..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="input-icons"><button type="button" tabIndex={-1}><Icon name="search" size={14} /></button></div>
        </div>
        <select className="input compact" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['الكل', 'منشور', 'موثّق', 'مسودة'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input compact" value={net} onChange={(e) => setNet(e.target.value)}>
          {['الكل', 'TRON', 'ETH', 'BSC', 'POLYGON'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <MenuButton
          label={`الفرز: ${SORTS.find((s) => s.id === sort)?.label}`}
          icon="arrows"
          active={sort}
          items={SORTS.map((s) => ({ id: s.id, label: s.label, onClick: () => setSort(s.id) }))}
        />
        {(q || status !== 'الكل' || net !== 'الكل') && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setQ(''); setStatus('الكل'); setNet('الكل'); }}>
            <Icon name="x" size={13} /> مسح الفلاتر
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonList rows={4} />
      ) : !hasAny ? (
        <EmptyState icon="code" title="لا توجد عقود بعد" hint="ابدأ بإنشاء عقدك الأول من قالب جاهز." actionLabel="إنشاء عقد جديد" onAction={() => go('engine')} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="لا توجد نتائج مطابقة"
          hint="جرّب تعديل كلمات البحث أو مسح الفلاتر."
          actionLabel="مسح الفلاتر"
          onAction={() => { setQ(''); setStatus('الكل'); setNet('الكل'); }}
        />
      ) : (
        <div className="cards-grid">
          {filtered.map((c) => (
            <article key={c.id} className="entity-card">
              <div className="row between">
                <div className="row" style={{ gap: 10, minWidth: 0 }}>
                  <span className="entity-icon">{c.symbol.slice(0, 2)}</span>
                  <div style={{ minWidth: 0 }}>
                    <h4 className="entity-title">{c.name}</h4>
                    <span className="tiny faint">{c.symbol} · {c.decimals} خانة عشرية</span>
                  </div>
                </div>
                <ContextMenu
                  actions={[
                    { label: 'فتح ملخص العقد', icon: 'eye', onClick: () => go('contract-summary', { contractId: c.id }) },
                    { label: 'تعيين كعقد نشط', icon: 'check', onClick: () => { setActiveContractId(c.id); toast('success', `العقد النشط الآن: ${c.name}`); } },
                    { label: 'نسخ عنوان العقد', icon: 'copy', disabled: c.status === 'draft', onClick: () => { navigator.clipboard?.writeText(c.address); toast('success', 'تم نسخ عنوان العقد ✅'); } },
                    { label: 'فتح المستكشف الخارجي', icon: 'external', disabled: c.status === 'draft', onClick: () => toast('info', 'فتح المستكشف الخارجي (عرض تجريبي)') },
                    ...(c.status === 'draft'
                      ? [
                          { label: 'تعديل المسودة', icon: 'edit' as const, onClick: () => go('contract-draft-edit', { contractId: c.id }) },
                          { label: 'حذف المسودة', icon: 'trash' as const, danger: true, onClick: () => setDelTarget(c.id) },
                        ]
                      : []),
                  ]}
                />
              </div>

              <div className="row mt-sm" style={{ gap: 7, flexWrap: 'wrap' }}>
                <StatusBadge status={c.status} />
                <span className={`badge ${c.netBadge.toLowerCase()}`}>{c.netBadge}</span>
                {c.verified ? (
                  <span className="badge green"><Icon name="shieldCheck" size={11} /> موثّق</span>
                ) : c.status !== 'draft' ? (
                  <span className="badge gray">غير موثّق</span>
                ) : null}
              </div>

              <div className="entity-addr mono">{c.status === 'draft' ? 'لم يُنشر بعد' : shortAddr(c.address, 10, 8)}</div>

              <div className="entity-meta">
                <span>العرض: <b>{fmt(c.supply)}</b></span>
                <span>الحاملون: <b>{c.holders}</b></span>
                <span>آخر تحديث: <b>{c.updatedAt}</b></span>
              </div>

              <div className="row mt-sm" style={{ gap: 8 }}>
                {c.status === 'draft' ? (
                  <>
                    <button type="button" className="btn btn-sm btn-primary grow" onClick={() => go('contract-draft-edit', { contractId: c.id })}>
                      <Icon name="edit" size={13} /> متابعة المسودة
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => setDelTarget(c.id)}>
                      <Icon name="trash" size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-sm btn-outline grow" onClick={() => go('contract-summary', { contractId: c.id })}>
                      <Icon name="eye" size={13} /> فتح الملخص
                    </button>
                    <CopyBtn text={c.address} small />
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={delTarget !== null}
        onClose={() => setDelTarget(null)}
        onConfirm={remove}
        title="حذف مسودة العقد؟"
        confirmLabel="نعم، حذف المسودة"
        danger
        body={<p className="muted small">سيتم حذف المسودة نهائيًا ولا يمكن التراجع عن هذا الإجراء.</p>}
      />
    </div>
  );
}
