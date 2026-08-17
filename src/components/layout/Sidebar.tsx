import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { ScreenId } from '../../state/AppContext';
import { NETWORKS } from '../../data/mock';

interface NavItem { id: ScreenId; label: string; icon: IconName; children?: ScreenId[] }
interface NavGroup { title: string; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    title: 'العمليات',
    items: [
      { id: 'dashboard', label: 'لوحة التحكم', icon: 'grid' },
      { id: 'contracts', label: 'محرك العقود', icon: 'code', children: ['engine', 'contract-summary', 'contract-draft-edit'] },
      { id: 'mint', label: 'وحدة السك', icon: 'hammer' },
      { id: 'send', label: 'وحدة الإرسال', icon: 'send' },
    ],
  },
  {
    title: 'الأصول والشبكات',
    items: [
      { id: 'wallets', label: 'إدارة المحافظ', icon: 'wallet', children: ['wallet-detail', 'wallet-import', 'wallet-connect'] },
      { id: 'network', label: 'اختيار الشبكة', icon: 'globe', children: ['network-test', 'network-custom'] },
      { id: 'transactions', label: 'سجل المعاملات', icon: 'clock', children: ['analytics'] },
      { id: 'address-book', label: 'دفتر العناوين', icon: 'book', children: ['address-create', 'address-edit'] },
    ],
  },
  {
    title: 'النظام',
    items: [
      { id: 'notifications', label: 'مركز الإشعارات', icon: 'bell' },
      { id: 'activity', label: 'سجل النشاط', icon: 'shield', children: ['activity-detail'] },
      { id: 'settings', label: 'الإعدادات', icon: 'settings' },
      { id: 'help', label: 'المساعدة والدعم', icon: 'info', children: ['help-topic', 'support', 'ticket-new', 'terms', 'policies'] },
    ],
  },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { screen, go, can, unread, defaultNetwork, online, role } = useApp();
  const net = NETWORKS.find((n) => n.id === defaultNetwork);

  const isActive = (it: NavItem) => screen === it.id || (it.children?.includes(screen) ?? false);

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="التنقل الرئيسي">
        <button type="button" className="icon-btn sidebar-mobile-close" onClick={onCloseMobile} aria-label="إغلاق القائمة">
          <Icon name="x" size={16} />
        </button>

        <button type="button" className="sidebar-logo as-link" onClick={() => { go('dashboard'); onCloseMobile(); }}>
          <div className="logo-mark">T</div>
          <div className="logo-text">
            Token Studio
            <small>نظام إدارة العقود الذكية</small>
          </div>
        </button>

        <div className="sidebar-sep" />

        <div className="nav-scroll">
          {GROUPS.map((g) => {
            const items = g.items.filter((it) => can(it.id));
            if (!items.length) return null;
            return (
              <div className="nav-group" key={g.title}>
                <div className="nav-group-title">{g.title}</div>
                <div className="nav-list">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`nav-item ${isActive(it) ? 'active' : ''}`}
                      onClick={() => { go(it.id); onCloseMobile(); }}
                    >
                      <Icon name={it.icon} size={18} />
                      <span className="grow">{it.label}</span>
                      {it.id === 'notifications' && unread > 0 && <span className="nav-badge">{unread}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-sep" />

        <button type="button" className="sidebar-footer as-link" onClick={() => { go('network'); onCloseMobile(); }}>
          <span className={`dot ${online ? 'green pulse' : 'red'}`} />
          <span className="grow">{online ? `متصل — ${net?.name ?? defaultNetwork}` : 'غير متصل'}</span>
          <Icon name="chevLeft" size={14} />
        </button>

        <div className="sidebar-role">
          <Icon name="users" size={13} />
          {role === 'owner' ? 'المالك' : role === 'operator' ? 'المشغّل' : 'المراقب'}
        </div>
      </nav>
    </>
  );
}
