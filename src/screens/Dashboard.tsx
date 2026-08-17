import { useState } from 'react';
import { Icon } from '../lib/icons';
import { CountUp } from '../components/ui/primitives';
import { Donut } from '../components/ui/charts';
import { TxDetailsModal } from '../components/TxDetailsModal';
import { TRANSACTIONS, USED_TODAY, DAILY_LIMIT } from '../data/mock';
import type { Tx } from '../data/mock';
import { fmt } from '../lib/format';
import { useApp } from '../state/AppContext';

export function Dashboard() {
  const { go } = useApp();
  const [tx, setTx] = useState<Tx | null>(null);
  const recent = TRANSACTIONS.slice(0, 5);
  const remaining = DAILY_LIMIT - USED_TODAY;

  return (
    <div>
      {/* صف بطاقات الإحصاء */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon green"><Icon name="dollar" size={22} /></div>
          <div>
            <div className="stat-label">المُرسَل اليوم</div>
            <div className="stat-value"><CountUp value={125000} prefix="$" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Icon name="arrows" size={22} /></div>
          <div>
            <div className="stat-label">المعاملات</div>
            <div className="stat-value"><CountUp value={12} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Icon name="scale" size={22} /></div>
          <div>
            <div className="stat-label">المتبقي اليومي</div>
            <div className="stat-value"><CountUp value={4875000} prefix="$" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icon name="shield" size={22} /></div>
          <div>
            <div className="stat-label">الشبكة النشطة</div>
            <div className="stat-value green" style={{ fontSize: 18 }}>TRON – TRC-20</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          {/* آخر المعاملات */}
          <h3 className="card-title h3" style={{ fontSize: 17 }}>آخر المعاملات</h3>
          <div className="card table-card">
            <div className="table-wrap">
              <table className="data clickable responsive">
                <thead>
                  <tr>
                    <th>الوقت</th>
                    <th>المستلم</th>
                    <th>المبلغ</th>
                    <th>الشبكة</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} onClick={() => setTx(t)}>
                      <td data-th="الوقت">{t.time}</td>
                      <td data-th="المستلم" className="mono-cell">{t.to}</td>
                      <td data-th="المبلغ">{fmt(t.amount)} وحدة</td>
                      <td data-th="الشبكة">
                        {t.netBadge === '—' ? '—' : <span className={`badge ${t.netBadge.toLowerCase()}`}>{t.netBadge}</span>}
                      </td>
                      <td data-th="الحالة">
                        <span className="status-cell">
                          <span className={`dot ${t.status === 'success' ? 'green' : t.status === 'pending' ? 'yellow' : 'red'}`} />
                          {t.status === 'success' ? 'مؤكدة' : t.status === 'pending' ? 'قيد الانتظار' : 'فاشلة'}
                        </span>
                      </td>
                      <td><span className="row-arrow"><Icon name="arrowLeft" size={15} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="center mt-lg">
            <button type="button" className="btn btn-primary btn-lg glow" onClick={() => go('send')}>
              معاملة جديدة <Icon name="plus" size={17} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* اللوحة اليمنى — إحصاءات سريعة */}
        <aside className="side-col">
          <div className="card">
            <h4 className="card-title h4">إحصاءات سريعة</h4>
            <div className="center">
              <Donut
                size={172}
                segments={[
                  { label: 'مُستخدَم', value: USED_TODAY, color: '#00d09c' },
                  { label: 'متبقٍ', value: remaining, color: '#3a3f5c' },
                ]}
                center={
                  <div>
                    <div className="tiny faint">المُستخدَم</div>
                    <div className="bold green" style={{ fontSize: 17 }}>2.5%</div>
                  </div>
                }
              />
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="swatch" style={{ background: '#00d09c' }} />
                مُستخدَم: ${fmt(USED_TODAY)}
              </div>
              <div className="legend-item">
                <span className="swatch" style={{ background: '#3a3f5c' }} />
                متبقٍ: ${fmt(remaining)}
              </div>
            </div>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> حالة النظام</h4>
            <div className="kv"><span className="k">زمن الاستجابة</span><span className="v green">45 مللي ثانية</span></div>
            <div className="kv"><span className="k">العقد المتصل</span><span className="v mono-cell">TNew7...AbCd</span></div>
            <div className="kv"><span className="k">آخر مزامنة</span><span className="v">قبل 3 ثوانٍ</span></div>
          </div>
        </aside>
      </div>

      <TxDetailsModal tx={tx} onClose={() => setTx(null)} />
    </div>
  );
}
