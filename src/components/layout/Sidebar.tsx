import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { ScreenId } from '../../state/AppContext';

const ITEMS: { id: ScreenId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: 'grid' },
  { id: 'engine', label: 'محرك العقود', icon: 'code' },
  { id: 'mint', label: 'وحدة السك', icon: 'hammer' },
  { id: 'send', label: 'وحدة الإرسال', icon: 'send' },
  { id: 'wallets', label: 'إدارة المحافظ', icon: 'wallet' },
  { id: 'network', label: 'اختيار الشبكة', icon: 'globe' },
  { id: 'transactions', label: 'سجل المعاملات', icon: 'clock' },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { screen, go } = useApp();

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <nav className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="التنقل الرئيسي">
        <button type="button" className="icon-btn sidebar-mobile-close" onClick={onCloseMobile} aria-label="إغلاق القائمة">
          <Icon name="x" size={16} />
        </button>

        <div className="sidebar-logo">
          <div className="logo-mark">T</div>
          <div className="logo-text">
            Token Studio
            <small>نظام إدارة العقود الذكية</small>
          </div>
        </div>

        <div className="sidebar-sep" />

        <div className="nav-list">
          {ITEMS.map((it) => (
            <button
              key={it.id}
              type="button"
              className={`nav-item ${screen === it.id ? 'active' : ''}`}
              onClick={() => {
                go(it.id);
                onCloseMobile();
              }}
            >
              <Icon name={it.icon} size={18} />
              {it.label}
            </button>
          ))}
        </div>

        <div className="sidebar-sep" />

        <div className="sidebar-footer">
          <span className="dot green pulse" />
          متصل — TRON الرئيسية
        </div>
      </nav>
    </>
  );
}
