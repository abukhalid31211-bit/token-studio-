import { useMemo, useState } from 'react';
import { Icon } from '../lib/icons';
import type { IconName } from '../lib/icons';
import { useApp } from '../state/AppContext';
import type { ScreenId } from '../state/AppContext';
import { PageHead, EmptyState, SkeletonList } from '../components/ui/shared';
import { Tabs } from '../components/ui/primitives';
import { ConfirmModal } from '../components/ui/Modal';
import type { NotifKind } from '../data/system';

const KIND_ICON: Record<NotifKind, IconName> = {
  mint: 'hammer',
  send: 'send',
  deploy: 'rocket',
  limit: 'scale',
  network: 'globe',
  fail: 'warning',
};

const KIND_TONE: Record<NotifKind, string> = {
  mint: 'blue',
  send: 'green',
  deploy: 'green',
  limit: 'yellow',
  network: 'yellow',
  fail: 'red',
};

/* شاشة مركز الإشعارات — SCR-NOTIF-CENTER */
export function NotificationsCenter() {
  const { notifications, markAllRead, markRead, clearNotifications, go, toast, unread } = useApp();
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const list = useMemo(() => {
    if (tab === 'unread') return notifications.filter((n) => !n.read);
    if (tab === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, tab]);

  return (
    <div>
      <PageHead
        title="مركز الإشعارات"
        sub={`${unread} إشعار غير مقروء من أصل ${notifications.length}`}
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث الإشعارات'); }, 650); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { markAllRead(); toast('success', 'تم تعليم الكل كمقروء ✅'); }} disabled={unread === 0}>
              <Icon name="check" size={14} /> تعليم الكل كمقروء
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setClearOpen(true)} disabled={notifications.length === 0}>
              <Icon name="trash" size={14} /> مسح الكل
            </button>
          </>
        }
      />

      <Tabs
        items={[
          { id: 'all', label: `كل الإشعارات (${notifications.length})` },
          { id: 'unread', label: `غير المقروءة (${unread})` },
          { id: 'read', label: `المقروءة (${notifications.length - unread})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="content-grid">
        <div className="tab-pane" key={tab}>
          {loading ? (
            <SkeletonList />
          ) : list.length === 0 ? (
            <EmptyState
              icon="bell"
              title={tab === 'unread' ? 'لا توجد إشعارات غير مقروءة' : tab === 'read' ? 'لا توجد إشعارات مقروءة' : 'لا توجد إشعارات'}
              hint="ستظهر هنا نتائج السك والإرسال والنشر وتنبيهات الحدود والشبكة."
              actionLabel="فتح إعدادات الإشعارات"
              onAction={() => go('settings', { settingsTab: 'notif' })}
            />
          ) : (
            <div className="card table-card">
              {list.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-row ${n.read ? 'read' : ''}`}
                  onClick={() => { markRead(n.id); go(n.target as ScreenId); }}
                >
                  <span className={`notif-icon ${KIND_TONE[n.kind]}`}><Icon name={KIND_ICON[n.kind]} size={17} /></span>
                  <span className="grow" style={{ minWidth: 0 }}>
                    <span className="row" style={{ gap: 8 }}>
                      {!n.read && <span className="unread-dot" />}
                      <b className="small">{n.title}</b>
                    </span>
                    <span className="tiny faint block">{n.body}</span>
                    <span className="tiny faint">{n.time}</span>
                  </span>
                  <Icon name="arrowLeft" size={15} className="row-arrow-static" />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="settings" size={15} className="green" /> تفضيلات الإشعارات</h4>
            <p className="muted small mb-sm">تحكم في أنواع الإشعارات ومدة بقاء الرسائل العائمة.</p>
            <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('settings', { settingsTab: 'notif' })}>
              فتح إعدادات الإشعارات
            </button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="pie" size={15} className="green" /> ملخص</h4>
            {(['mint', 'send', 'deploy', 'limit', 'network', 'fail'] as NotifKind[]).map((k) => {
              const count = notifications.filter((n) => n.kind === k).length;
              const labels: Record<NotifKind, string> = { mint: 'اكتمال السك', send: 'اكتمال الإرسال', deploy: 'نتيجة النشر', limit: 'تحذير الحد', network: 'حالة الشبكة', fail: 'فشل العمليات' };
              return (
                <div key={k} className="kv">
                  <span className="k"><Icon name={KIND_ICON[k]} size={13} /> {labels[k]}</span>
                  <span className="v">{count}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => { clearNotifications(); setClearOpen(false); toast('success', 'تم مسح كل الإشعارات ✅'); }}
        title="مسح كل الإشعارات؟"
        confirmLabel="نعم، مسح الكل"
        danger
        body={<p className="muted small">سيتم حذف جميع الإشعارات ولا يمكن استرجاعها.</p>}
      />
    </div>
  );
}
