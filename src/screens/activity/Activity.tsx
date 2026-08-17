import { useMemo, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, EmptyState, MenuButton, SkeletonTable, KV, StatusBadge } from '../../components/ui/shared';
import { Pagination, CopyBtn } from '../../components/ui/primitives';
import { ACTIVITY_EVENTS } from '../../data/system';
import { downloadFile, toCsv } from '../../lib/format';
import { TRANSACTIONS } from '../../data/mock';
import { TxDetailsModal } from '../../components/TxDetailsModal';
import type { Tx } from '../../data/mock';

const KINDS = ['الكل', 'تنفيذ سك', 'إرسال جماعي', 'نشر عقد', 'تعديل الإعدادات', 'فتح القفل', 'محاولة دخول', 'ربط محفظة', 'تصدير سجل', 'تغيير صلاحيات', 'محاولة سك'];
const USERS = ['الكل', 'المالك', 'المشغّل', 'المراقب', 'غير معروف'];
const SORTS = [
  { id: 'newest', label: 'الأحدث أولًا' },
  { id: 'oldest', label: 'الأقدم أولًا' },
];

/* شاشة سجل النشاط — SCR-ACT-LOG */
export function ActivityLog() {
  const { go, toast } = useApp();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('الكل');
  const [user, setUser] = useState('الكل');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = ACTIVITY_EVENTS.filter((e) => {
      if (kind !== 'الكل' && e.kind !== kind) return false;
      if (user !== 'الكل' && e.user !== user) return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      if (q && !`${e.kind} ${e.user} ${e.section} ${e.after}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const ka = a.date + a.time, kb = b.date + b.time;
      return sort === 'oldest' ? ka.localeCompare(kb) : kb.localeCompare(ka);
    });
    return list;
  }, [q, kind, user, from, to, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  const hasFilters = q || kind !== 'الكل' || user !== 'الكل' || from || to;

  const doExport = (fmtKind: 'csv' | 'json') => {
    toast('info', 'جارٍ التصدير...');
    setTimeout(() => {
      if (fmtKind === 'csv') {
        downloadFile('activity-log.csv', toCsv([
          ['التاريخ', 'الوقت', 'نوع الحدث', 'المستخدم', 'القسم', 'النتيجة', 'IP'],
          ...filtered.map((e) => [e.date, e.time, e.kind, e.user, e.section, e.result === 'success' ? 'ناجح' : 'فاشل', e.ip]),
        ]), 'text/csv');
      } else {
        downloadFile('activity-log.json', JSON.stringify(filtered, null, 2), 'application/json');
      }
      toast('success', 'اكتمل التصدير ✅');
    }, 700);
  };

  return (
    <div>
      <PageHead
        title="سجل النشاط"
        sub={`${filtered.length} حدث مسجَّل`}
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث سجل النشاط'); }, 650); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <MenuButton
              label="تصدير"
              icon="download"
              variant="primary"
              items={[
                { id: 'csv', label: 'تصدير CSV', onClick: () => doExport('csv') },
                { id: 'json', label: 'تصدير JSON', onClick: () => doExport('json') },
              ]}
            />
          </>
        }
      />

      <div className="toolbar">
        <div className="input-wrap grow" style={{ maxWidth: 300 }}>
          <input className="input" placeholder="البحث في أحداث النشاط..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <div className="input-icons"><button type="button" tabIndex={-1}><Icon name="search" size={14} /></button></div>
        </div>
        <select className="input compact" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
          {KINDS.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select className="input compact" value={user} onChange={(e) => { setUser(e.target.value); setPage(1); }}>
          {USERS.map((u) => <option key={u}>{u}</option>)}
        </select>
        <input className="input compact" type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="من تاريخ" />
        <input className="input compact" type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="إلى تاريخ" />
        <MenuButton label={SORTS.find((s) => s.id === sort)!.label} icon="arrows" active={sort} items={SORTS.map((s) => ({ id: s.id, label: s.label, onClick: () => setSort(s.id) }))} />
        {hasFilters && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setQ(''); setKind('الكل'); setUser('الكل'); setFrom(''); setTo(''); }}>
            <Icon name="x" size={13} /> مسح الفلاتر
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title={hasFilters ? 'لا توجد نتائج مطابقة' : 'لا توجد أحداث'}
          hint={hasFilters ? 'جرّب توسيع نطاق التاريخ أو مسح الفلاتر.' : 'ستُسجَّل الأحداث تلقائيًا عند استخدام النظام.'}
          actionLabel={hasFilters ? 'مسح الفلاتر' : undefined}
          onAction={() => { setQ(''); setKind('الكل'); setUser('الكل'); setFrom(''); setTo(''); }}
        />
      ) : (
        <>
          <div className="card table-card">
            <div className="table-wrap">
              <table className="data clickable responsive">
                <thead>
                  <tr><th>الوقت</th><th>نوع الحدث</th><th>المستخدم</th><th>القسم</th><th>النتيجة</th><th></th></tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id} onClick={() => go('activity-detail', { activityId: e.id })}>
                      <td data-th="الوقت">{e.date} · {e.time}</td>
                      <td data-th="نوع الحدث"><b>{e.kind}</b></td>
                      <td data-th="المستخدم">{e.user}</td>
                      <td data-th="القسم">{e.section}</td>
                      <td data-th="النتيجة"><StatusBadge status={e.result} /></td>
                      <td><span className="row-arrow"><Icon name="arrowLeft" size={15} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} perPage={perPage} onPerPage={(n) => { setPerPage(n); setPage(1); }} />
        </>
      )}
    </div>
  );
}

/* شاشة تفاصيل حدث النشاط — SCR-ACT-DETAIL */
export function ActivityDetail() {
  const { params, go, toast } = useApp();
  const event = ACTIVITY_EVENTS.find((e) => e.id === params.activityId) ?? ACTIVITY_EVENTS[0];
  const [tx, setTx] = useState<Tx | null>(null);

  if (!event) {
    return <EmptyState icon="file" title="الحدث غير موجود" actionLabel="العودة لسجل النشاط" onAction={() => go('activity')} />;
  }

  const relatedTx = TRANSACTIONS.find((t) => t.id === event.relatedTx);

  return (
    <div>
      <Breadcrumb items={[{ label: 'سجل النشاط', to: 'activity' }, { label: 'تفاصيل الحدث' }]} />
      <PageHead
        title={event.kind}
        sub={`${event.date} · ${event.time}`}
        backTo="activity"
        actions={
          <>
            <CopyBtn text={`${event.id} — ${event.kind} — ${event.date} ${event.time}`} label="نسخ معرف الحدث" />
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم تحديث بيانات الحدث')}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
          </>
        }
      />

      <div className="stats-row">
        <div className="stat-card">
          <div className={`stat-icon ${event.result === 'success' ? 'green' : 'red'}`}><Icon name={event.result === 'success' ? 'check' : 'warning'} size={22} /></div>
          <div><div className="stat-label">نتيجة الحدث</div><div className="stat-value" style={{ fontSize: 17 }}>{event.result === 'success' ? 'ناجح' : 'فاشل'}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Icon name="users" size={22} /></div>
          <div><div className="stat-label">المستخدم</div><div className="stat-value" style={{ fontSize: 17 }}>{event.user}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Icon name="grid" size={22} /></div>
          <div><div className="stat-label">القسم المرتبط</div><div className="stat-value" style={{ fontSize: 16 }}>{event.section}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icon name="clock" size={22} /></div>
          <div><div className="stat-label">الطابع الزمني</div><div className="stat-value" style={{ fontSize: 16 }}>{event.time}</div></div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          <div className="card mb">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> بيانات الحدث</h4>
            <KV k="معرف الحدث" v={event.id.toUpperCase()} mono />
            <KV k="نوع الحدث" v={event.kind} />
            <KV k="الدور" v={event.role} />
            <KV k="عنوان IP" v={event.ip} mono />
            <KV k="الجهاز" v={event.device} />
            <KV k="التاريخ" v={`${event.date} ${event.time}`} />
          </div>

          <div className="card">
            <h4 className="card-title h4"><Icon name="arrows" size={15} className="green" /> القيم قبل التغيير وبعده</h4>
            <div className="diff-grid">
              <div className="diff-col before">
                <span className="tiny faint">قبل</span>
                <div className="diff-value">{event.before}</div>
              </div>
              <Icon name="arrowLeft" size={18} className="diff-arrow" />
              <div className="diff-col after">
                <span className="tiny faint">بعد</span>
                <div className="diff-value">{event.after}</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="side-col">
          {relatedTx && (
            <div className="card tight">
              <h4 className="card-title h4"><Icon name="link" size={15} className="green" /> المعاملة المرتبطة</h4>
              <KV k="المعرف" v={relatedTx.txHash.slice(0, 12)} mono />
              <KV k="الكمية" v={relatedTx.amount.toLocaleString('en-US')} />
              <KV k="الحالة" v={<StatusBadge status={relatedTx.status} />} />
              <button type="button" className="btn btn-sm btn-outline btn-block mt-sm" onClick={() => setTx(relatedTx)}>
                فتح تفاصيل المعاملة
              </button>
            </div>
          )}

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="users" size={15} className="green" /> صاحب الحدث</h4>
            <div className="list-row" style={{ borderBottom: 'none' }}>
              <span className="avatar-circle">{event.user.slice(0, 2)}</span>
              <div><b className="small">{event.user}</b><div className="tiny faint">{event.role}</div></div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost btn-block" onClick={() => go('profile')}>فتح الملف الشخصي</button>
          </div>

          <button type="button" className="btn btn-outline btn-block" onClick={() => go('activity')}>
            <Icon name="arrowRight" size={15} /> العودة لسجل النشاط
          </button>
        </aside>
      </div>

      <TxDetailsModal tx={tx} onClose={() => setTx(null)} />
    </div>
  );
}
