import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { WALLET, NETWORKS } from '../../data/mock';
import { SYSTEM_INFO, PROFILE } from '../../data/system';
import { useApp, SCREEN_TITLES } from '../../state/AppContext';
import type { ScreenId, UserRole } from '../../state/AppContext';
import { ConfirmModal } from '../ui/Modal';

const NOTIF_TONE: Record<string, string> = {
  mint: 'blue', send: 'green', deploy: 'green', limit: 'yellow', network: 'yellow', fail: 'red',
};
const NOTIF_ICON: Record<string, 'hammer' | 'send' | 'rocket' | 'scale' | 'globe' | 'warning'> = {
  mint: 'hammer', send: 'send', deploy: 'rocket', limit: 'scale', network: 'globe', fail: 'warning',
};

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const {
    screen, go, notifications, unread, markAllRead, markRead, toast,
    role, setRole, online, setOnline, setSessionWarn, setLocked, defaultNetwork,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [titleKey, setTitleKey] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  const net = NETWORKS.find((n) => n.id === defaultNetwork);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNotifOpen(false); setMenuOpen(false); setAcctOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onEsc); };
  }, []);

  useEffect(() => { setTitleKey((k) => k + 1); }, [screen]);

  const closeAll = () => { setNotifOpen(false); setMenuOpen(false); setAcctOpen(false); };
  const nav = (target: ScreenId) => { closeAll(); go(target); };

  const roleLabel: Record<UserRole, string> = { owner: 'المالك', operator: 'المشغّل', viewer: 'المراقب' };

  return (
    <header className="topbar">
      <button type="button" className="icon-btn hamburger" onClick={onOpenMobileNav} aria-label="فتح القائمة">
        <Icon name="menu" size={18} />
      </button>

      <h1 className="topbar-title" key={titleKey}>{SCREEN_TITLES[screen]}</h1>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        {/* شريحة الشبكة */}
        <button type="button" className="net-chip hide-sm" onClick={() => go('network')} title="تغيير الشبكة">
          <span className="dot" style={{ background: net?.color ?? '#00d09c' }} />
          {net?.name ?? defaultNetwork}
          <Icon name="chevDown" size={12} />
        </button>

        {/* MNU-TOP-OPTIONS */}
        <div className="dropdown" ref={menuRef}>
          <button type="button" className="icon-btn" aria-label="خيارات" onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); setAcctOpen(false); }}>
            <Icon name="dotsV" size={18} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu small align-end">
              <button type="button" className="dropdown-item" onClick={() => nav('settings')}>
                <Icon name="settings" size={15} /> الإعدادات
              </button>
              <button type="button" className="dropdown-item" onClick={() => nav('activity')}>
                <Icon name="shield" size={15} /> سجل النشاط
              </button>
              <button type="button" className="dropdown-item" onClick={() => nav('help')}>
                <Icon name="info" size={15} /> مركز المساعدة
              </button>
              <div className="dropdown-sep" />
              <div className="dropdown-head tiny">وضع العرض التجريبي</div>
              <button type="button" className="dropdown-item" onClick={() => { closeAll(); setOnline(!online); toast(online ? 'warning' : 'success', online ? 'تم تفعيل وضع عدم الاتصال' : 'تمت استعادة الاتصال'); }}>
                <Icon name="globe" size={15} /> {online ? 'محاكاة انقطاع الاتصال' : 'استعادة الاتصال'}
              </button>
              <button type="button" className="dropdown-item" onClick={() => { closeAll(); setSessionWarn(true); }}>
                <Icon name="clock" size={15} /> محاكاة قرب انتهاء الجلسة
              </button>
              <div className="dropdown-sep" />
              <button type="button" className="dropdown-item" onClick={() => { closeAll(); setAboutOpen(true); }}>
                <Icon name="info" size={15} /> حول النظام
              </button>
            </div>
          )}
        </div>

        {/* شريحة المحفظة */}
        <button type="button" className="wallet-chip" onClick={() => go('wallets')} title="إدارة المحافظ">
          <span className={`dot ${online ? 'green' : 'red'}`} />
          {WALLET.short}
        </button>

        {/* MNU-TOP-NOTIF */}
        <div className="dropdown" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="الإشعارات"
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); setAcctOpen(false); }}
          >
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="badge-dot" />}
          </button>
          {notifOpen && (
            <div className="dropdown-menu align-end">
              <div className="dropdown-head">
                الإشعارات
                <span className="tiny faint">{unread} غير مقروء</span>
              </div>
              {notifications.length === 0 ? (
                <div className="dropdown-empty">
                  <Icon name="bell" size={22} />
                  <span className="small faint">لا توجد إشعارات</span>
                </div>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`notif-card ${n.read ? 'read' : ''}`}
                    onClick={() => { markRead(n.id); closeAll(); go((n.target ?? 'notifications') as ScreenId); }}
                  >
                    <span className={`n-icon ${NOTIF_TONE[n.kind] ?? 'blue'}`}>
                      <Icon name={NOTIF_ICON[n.kind] ?? 'bell'} size={13} />
                    </span>
                    <span className="grow">
                      <div className="n-title">{n.title}</div>
                      <div className="n-time">{n.time}</div>
                    </span>
                    {!n.read && <span className="n-dot" />}
                  </button>
                ))
              )}
              <div className="dropdown-sep" />
              <div className="dropdown-foot">
                <button type="button" className="btn-text-blue" onClick={() => { markAllRead(); toast('success', 'تم تعليم الكل كمقروء'); }}>
                  تعليم الكل كمقروء
                </button>
                <button type="button" className="btn-text-blue" onClick={() => nav('notifications')}>عرض الكل</button>
              </div>
            </div>
          )}
        </div>

        {/* MNU-TOP-ACCOUNT */}
        <div className="dropdown" ref={acctRef}>
          <button type="button" className="avatar-btn" aria-label="الحساب" onClick={() => { setAcctOpen((v) => !v); setMenuOpen(false); setNotifOpen(false); }}>
            {PROFILE.displayName.slice(0, 1)}
          </button>
          {acctOpen && (
            <div className="dropdown-menu align-end">
              <div className="acct-head">
                <div className="avatar-circle lg">{PROFILE.displayName.slice(0, 1)}</div>
                <div>
                  <div className="bold small">{PROFILE.displayName}</div>
                  <div className="tiny faint">{PROFILE.email}</div>
                  <span className="chip tiny mt-sm">{roleLabel[role]}</span>
                </div>
              </div>
              <div className="dropdown-sep" />
              <button type="button" className="dropdown-item" onClick={() => nav('profile')}>
                <Icon name="users" size={15} /> الملف الشخصي
              </button>
              <button type="button" className="dropdown-item" onClick={() => nav('roles')}>
                <Icon name="shieldCheck" size={15} /> الأدوار والصلاحيات
              </button>
              <button type="button" className="dropdown-item" onClick={() => nav('sessions')}>
                <Icon name="lock" size={15} /> الجلسات النشطة
              </button>
              <div className="dropdown-sep" />
              <div className="dropdown-head tiny">تبديل الدور (عرض تجريبي)</div>
              {(['owner', 'operator', 'viewer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`dropdown-item ${role === r ? 'is-active' : ''}`}
                  onClick={() => { setRole(r); closeAll(); toast('info', `تم التبديل إلى دور: ${roleLabel[r]}`); }}
                >
                  <Icon name={role === r ? 'check' : 'users'} size={15} /> {roleLabel[r]}
                </button>
              ))}
              <div className="dropdown-sep" />
              <button type="button" className="dropdown-item" onClick={() => { closeAll(); setLocked(true); go('unlock'); }}>
                <Icon name="lock" size={15} /> قفل النظام
              </button>
              <button type="button" className="dropdown-item danger" onClick={() => { closeAll(); setLogoutOpen(true); }}>
                <Icon name="logout" size={15} /> تسجيل الخروج
              </button>
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
          <div className="small" style={{ lineHeight: 1.9 }}>
            <p className="muted">
              <b className="green">{SYSTEM_INFO.name} — {SYSTEM_INFO.version}</b> — نظام متكامل لإدارة العقود الذكية:
              إنشاء العملات الرقمية من القوالب، الترجمة والنشر على شبكات متعددة، السك الفردي والجماعي،
              الإرسال، وإدارة المحافظ — من واجهة واحدة.
            </p>
            <div className="modal-sep" />
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="faint">رقم البناء</span><b className="mono-cell">{SYSTEM_INFO.build}</b></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="faint">آخر تحديث</span><b>{SYSTEM_INFO.lastUpdate}</b></div>
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="faint">المحرك</span><b>{SYSTEM_INFO.engine}</b></div>
          </div>
        }
      />

      {/* MOD-LOGOUT-CONFIRM */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => { setLogoutOpen(false); toast('warning', 'تم تسجيل الخروج'); go('welcome'); }}
        title="تسجيل الخروج؟"
        confirmLabel="نعم، خروج"
        danger
        body={<p className="muted small">سيتم إنهاء الجلسة الحالية. المسودات المحفوظة تبقى كما هي.</p>}
      />
    </header>
  );
}
