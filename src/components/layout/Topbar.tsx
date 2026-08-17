import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { NOTIFICATIONS, WALLET } from '../../data/mock';
import { useApp, SCREEN_TITLES } from '../../state/AppContext';
import type { ScreenId } from '../../state/AppContext';
import { ConfirmModal } from '../ui/Modal';

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { screen, go, unread, markRead, toast } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [titleKey, setTitleKey] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* إغلاق القوائم عند النقر خارجها */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    setTitleKey((k) => k + 1);
  }, [screen]);

  const openNotif = (target: string) => {
    setNotifOpen(false);
    go(target as ScreenId);
  };

  return (
    <header className="topbar">
      <button type="button" className="icon-btn hamburger" onClick={onOpenMobileNav} aria-label="فتح القائمة">
        <Icon name="menu" size={18} />
      </button>

      <h1 className="topbar-title" key={titleKey}>{SCREEN_TITLES[screen]}</h1>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        {/* قائمة النقاط الثلاث */}
        <div className="dropdown" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="خيارات"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
          >
            <Icon name="dotsV" size={18} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu small">
              <button type="button" className="dropdown-item" onClick={() => { setMenuOpen(false); toast('info', 'الإعدادات — قريباً ⚙️'); }}>
                <Icon name="settings" size={15} /> الإعدادات
              </button>
              <button type="button" className="dropdown-item danger" onClick={() => { setMenuOpen(false); setDisconnectOpen(true); }}>
                <Icon name="logout" size={15} /> قطع الاتصال
              </button>
              <button type="button" className="dropdown-item" onClick={() => { setMenuOpen(false); setAboutOpen(true); }}>
                <Icon name="info" size={15} /> حول النظام
              </button>
            </div>
          )}
        </div>

        {/* شريحة المحفظة */}
        <div className="wallet-chip">
          <span className="dot green" />
          {WALLET.short}
        </div>

        {/* الإشعارات */}
        <div className="dropdown" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="الإشعارات"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
              if (!notifOpen) markRead();
            }}
          >
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="badge-dot" />}
          </button>
          {notifOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-head">
                الإشعارات
                <span className="tiny faint">{NOTIFICATIONS.length}</span>
              </div>
              {NOTIFICATIONS.map((n) => (
                <button key={n.id} type="button" className={`notif-card ${n.read ? 'read' : ''}`} onClick={() => openNotif(n.target)}>
                  <span className="n-dot" />
                  <span>
                    <div className="n-title">{n.title}</div>
                    <div className="n-time">{n.time}</div>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* حول النظام */}
      <ConfirmModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onConfirm={() => setAboutOpen(false)}
        title="حول النظام"
        confirmLabel="حسناً"
        body={
          <p className="muted small" style={{ lineHeight: 1.9 }}>
            <b className="green">Token Studio v1.0</b> — نظام متكامل لإدارة العقود الذكية: إنشاء العملات الرقمية من القوالب،
            الترجمة والنشر على شبكات متعددة، السك الفردي والجماعي، الإرسال، وإدارة المحافظ — كل ذلك من واجهة واحدة.
          </p>
        }
      />

      {/* قطع الاتصال */}
      <ConfirmModal
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        onConfirm={() => {
          setDisconnectOpen(false);
          toast('warning', 'تم قطع اتصال المحفظة');
        }}
        title="قطع اتصال المحفظة؟"
        confirmLabel="نعم، قطع الاتصال"
        danger
        body={<p className="muted small">سيتم قطع الاتصال بالمحفظة TLa5...7mKq. يمكنك إعادة الاتصال في أي وقت.</p>}
      />
    </header>
  );
}
