import { useMemo, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { AddressEntry } from '../../state/AppContext';
import { PageHead, EmptyState, ContextMenu, MenuButton, SkeletonList } from '../../components/ui/shared';
import { ConfirmModal } from '../../components/ui/Modal';
import { copyText, shortAddr } from '../../lib/format';

const SORTS = [
  { id: 'recent', label: 'الأحدث استخدامًا' },
  { id: 'name', label: 'الاسم أبجديًا' },
  { id: 'oldest', label: 'الأقدم إضافة' },
];

/* شاشة دفتر العناوين — SCR-ADDR-LIST */
export function AddressBookScreen() {
  const { addresses, setAddresses, go, toast } = useApp();
  const [q, setQ] = useState('');
  const [net, setNet] = useState('الكل');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [delTarget, setDelTarget] = useState<AddressEntry | null>(null);

  const filtered = useMemo(() => {
    let list = addresses.filter((a) => {
      if (net !== 'الكل' && a.net !== net) return false;
      if (q && !`${a.name} ${a.addr}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      return 0;
    });
    return list;
  }, [addresses, q, net, sort]);

  return (
    <div>
      <PageHead
        title="دفتر العناوين"
        sub={`${addresses.length} جهة عنوان محفوظة`}
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث دفتر العناوين'); }, 700); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go('address-create')}>
              <Icon name="plus" size={14} strokeWidth={3} /> إنشاء جهة عنوان
            </button>
          </>
        }
      />

      <div className="toolbar">
        <div className="input-wrap grow" style={{ maxWidth: 340 }}>
          <input className="input" placeholder="البحث بالاسم أو العنوان..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="input-icons"><button type="button" tabIndex={-1}><Icon name="search" size={14} /></button></div>
        </div>
        <select className="input compact" value={net} onChange={(e) => setNet(e.target.value)}>
          {['الكل', 'TRC20', 'ERC20', 'BEP20'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <MenuButton
          label={`الفرز: ${SORTS.find((s) => s.id === sort)?.label}`}
          icon="arrows"
          active={sort}
          items={SORTS.map((s) => ({ id: s.id, label: s.label, onClick: () => setSort(s.id) }))}
        />
      </div>

      {loading ? (
        <SkeletonList />
      ) : addresses.length === 0 ? (
        <EmptyState icon="book" title="لا توجد جهات عناوين" hint="أضف أول جهة عنوان لتسريع عمليات الإرسال." actionLabel="إنشاء جهة عنوان" onAction={() => go('address-create')} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="لا توجد نتائج مطابقة" hint="جرّب تعديل البحث أو الفلاتر." actionLabel="مسح الفلاتر" onAction={() => { setQ(''); setNet('الكل'); }} />
      ) : (
        <div className="card table-card">
          {filtered.map((a) => (
            <div key={a.id} className="list-row">
              <span className="avatar-circle">{a.name.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2)}</span>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <b className="small">{a.name}</b>
                  <span className={`badge ${a.net.toLowerCase()}`}>{a.net}</span>
                </div>
                <div className="mono tiny faint">{shortAddr(a.addr, 12, 8)}</div>
                {a.note && <div className="tiny faint">{a.note}</div>}
              </div>
              <span className="tiny faint hide-sm">آخر استخدام: {a.lastUsed}</span>
              <button type="button" className="btn btn-xs btn-outline" onClick={() => go('send', { prefillAddr: a.addr })}>
                <Icon name="send" size={12} /> إرسال
              </button>
              <ContextMenu
                actions={[
                  { label: 'إرسال إلى هذا العنوان', icon: 'send', onClick: () => go('send', { prefillAddr: a.addr }) },
                  { label: 'نسخ العنوان', icon: 'copy', onClick: () => { copyText(a.addr); toast('success', 'تم نسخ العنوان ✅'); } },
                  { label: 'تعديل جهة العنوان', icon: 'edit', onClick: () => go('address-edit', { addressId: a.id }) },
                  { label: 'حذف جهة العنوان', icon: 'trash', danger: true, onClick: () => setDelTarget(a) },
                ]}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={delTarget !== null}
        onClose={() => setDelTarget(null)}
        onConfirm={() => {
          setAddresses((list) => list.filter((x) => x.id !== delTarget?.id));
          toast('success', `تم حذف ${delTarget?.name} ✅`);
          setDelTarget(null);
        }}
        title="حذف جهة العنوان؟"
        confirmLabel="نعم، حذف"
        danger
        body={<p className="muted small">سيتم حذف <b>{delTarget?.name}</b> من دفتر العناوين نهائيًا.</p>}
      />
    </div>
  );
}
