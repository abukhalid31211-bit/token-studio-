import { useEffect, useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { Breadcrumb, PageHead, KV, StatusBadge, SkeletonCards, EmptyState } from '../../components/ui/shared';
import { CopyBtn } from '../../components/ui/primitives';
import { Donut } from '../../components/ui/charts';
import { TxDetailsModal } from '../../components/TxDetailsModal';
import { TRANSACTIONS, HOLDERS } from '../../data/mock';
import type { Tx } from '../../data/mock';
import { fmt } from '../../lib/format';

const TYPE_LABEL: Record<string, string> = { mint: 'سك', send: 'إرسال', burn: 'حرق' };

/* شاشة ملخص العقد — SCR-CONT-SUMMARY */
export function ContractSummary() {
  const { params, contracts, go, toast, setActiveContractId } = useApp();
  const contract = contracts.find((c) => c.id === params.contractId) ?? contracts[0];
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<Tx | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [params.contractId]);

  if (!contract) {
    return <EmptyState icon="code" title="العقد غير موجود" hint="ربما حُذف هذا العقد." actionLabel="العودة لقائمة العقود" onAction={() => go('contracts')} />;
  }

  const txs = TRANSACTIONS.slice(0, 6);

  return (
    <div>
      <Breadcrumb items={[{ label: 'محرك العقود', to: 'contracts' }, { label: 'ملخص العقد' }]} />
      <PageHead
        title={`${contract.name} (${contract.symbol})`}
        sub={contract.status === 'draft' ? 'مسودة غير منشورة' : 'عقد منشور على الشبكة'}
        backTo="contracts"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث بيانات العقد'); }, 700); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('info', 'فتح المستكشف الخارجي (عرض تجريبي)')}>
              <Icon name="external" size={14} /> المستكشف
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => { setActiveContractId(contract.id); go('mint'); }}>
              <Icon name="hammer" size={14} /> السك بهذا العقد
            </button>
          </>
        }
      />

      {loading ? (
        <SkeletonCards count={4} />
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon blue"><Icon name="code" size={22} /></div>
              <div><div className="stat-label">حالة العقد</div><div className="stat-value" style={{ fontSize: 18 }}><StatusBadge status={contract.status} /></div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><Icon name="pie" size={22} /></div>
              <div><div className="stat-label">إجمالي العرض</div><div className="stat-value" style={{ fontSize: 19 }}>{fmt(contract.supply)}</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow"><Icon name="users" size={22} /></div>
              <div><div className="stat-label">الحاملون</div><div className="stat-value">{contract.holders}</div></div>
            </div>
            <div className="stat-card">
              <div className={`stat-icon ${contract.verified ? 'green' : 'red'}`}><Icon name="shieldCheck" size={22} /></div>
              <div><div className="stat-label">حالة التوثيق</div><div className="stat-value" style={{ fontSize: 17 }}>{contract.verified ? 'موثّق ✓' : 'غير موثّق'}</div></div>
            </div>
          </div>

          <div className="content-grid">
            <div>
              <div className="card mb">
                <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> هوية العقد</h4>
                <KV k="اسم التوكن" v={contract.name} />
                <KV k="الرمز" v={contract.symbol} />
                <KV k="الشبكة" v={<span className={`badge ${contract.netBadge.toLowerCase()}`}>{contract.netBadge}</span>} />
                <KV k="عنوان العقد" v={contract.status === 'draft' ? '—' : <span className="row" style={{ gap: 6 }}><span className="mono-cell">{contract.address.slice(0, 12)}...{contract.address.slice(-6)}</span><CopyBtn text={contract.address} small /></span>} />
                <KV k="المالك" v={contract.owner} mono />
                <KV k="تاريخ الإنشاء" v={contract.createdAt} />
              </div>

              <div className="card mb">
                <h4 className="card-title h4"><Icon name="settings" size={15} className="green" /> إعدادات التوكن</h4>
                <KV k="القالب" v={contract.template} />
                <KV k="الخانات العشرية" v={contract.decimals} />
                <KV k="إصدار المترجم" v={contract.compiler} mono />
                <KV k="العرض الأولي" v={`${fmt(contract.supply)} وحدة`} />
                <KV k="آخر تحديث" v={contract.updatedAt} />
              </div>

              <h3 className="card-title h3" style={{ fontSize: 16 }}>معاملات العقد</h3>
              <div className="card table-card">
                <div className="table-wrap">
                  <table className="data clickable responsive">
                    <thead>
                      <tr><th>الوقت</th><th>النوع</th><th>الكمية</th><th>الحالة</th><th></th></tr>
                    </thead>
                    <tbody>
                      {txs.map((t) => (
                        <tr key={t.id} onClick={() => setTx(t)}>
                          <td data-th="الوقت">{t.date} {t.time}</td>
                          <td data-th="النوع"><span className={`badge ${t.type}`}>{TYPE_LABEL[t.type]}</span></td>
                          <td data-th="الكمية">{fmt(t.amount)}</td>
                          <td data-th="الحالة"><StatusBadge status={t.status} /></td>
                          <td><span className="row-arrow"><Icon name="arrowLeft" size={15} /></span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button type="button" className="btn btn-outline btn-block mt" onClick={() => go('transactions')}>
                عرض معاملات العقد في السجل الكامل
              </button>
            </div>

            <aside className="side-col">
              <div className="card">
                <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> توزيع العرض</h4>
                <div className="center">
                  <Donut
                    size={158}
                    thickness={20}
                    segments={HOLDERS.map((h) => ({ label: h.label, value: h.value, color: h.color }))}
                    center={<div><div className="tiny faint">العرض</div><div className="bold" style={{ fontSize: 13 }}>{(contract.supply / 1e6).toFixed(1)}M</div></div>}
                  />
                </div>
                <div className="legend">
                  {HOLDERS.map((h) => (
                    <div key={h.label} className="legend-item">
                      <span className="swatch" style={{ background: h.color }} />
                      <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.label}</span>
                      <b>{((h.value / HOLDERS.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)}%</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card tight">
                <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> إجراءات سريعة</h4>
                <div className="col" style={{ gap: 8 }}>
                  <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => { setActiveContractId(contract.id); go('mint'); }}>
                    <Icon name="hammer" size={14} /> السك بهذا العقد
                  </button>
                  <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => { setActiveContractId(contract.id); go('send'); }}>
                    <Icon name="send" size={14} /> الإرسال من هذا العقد
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost btn-block" onClick={() => toast('info', 'فتح المستكشف الخارجي (عرض تجريبي)')}>
                    <Icon name="external" size={14} /> فتح المستكشف الخارجي
                  </button>
                </div>
              </div>

              <div className="card tight">
                <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> أحداث العقد</h4>
                <div className="timeline">
                  <div className="tl-item"><span className="tl-dot green" /><div><b className="small">تم التوثيق</b><div className="tiny faint">{contract.updatedAt}</div></div></div>
                  <div className="tl-item"><span className="tl-dot blue" /><div><b className="small">تم النشر على {contract.network}</b><div className="tiny faint">{contract.createdAt}</div></div></div>
                  <div className="tl-item"><span className="tl-dot gray" /><div><b className="small">تمت الترجمة بنجاح</b><div className="tiny faint">{contract.createdAt}</div></div></div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <TxDetailsModal tx={tx} onClose={() => setTx(null)} />
    </div>
  );
}
