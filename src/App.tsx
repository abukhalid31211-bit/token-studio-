import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AppProvider, useApp, AUTH_SCREENS } from './state/AppContext';
import type { ScreenId } from './state/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastStack } from './components/ui/Toasts';
import { BottomBars } from './components/layout/BottomBars';

/* الأقسام الرئيسية */
import { Dashboard } from './screens/Dashboard';
import { ContractEngine } from './screens/engine/ContractEngine';
import { MintScreen } from './screens/Mint';
import { SendScreen } from './screens/Send';
import { WalletsScreen } from './screens/Wallets';
import { NetworkScreen } from './screens/Network';
import { TransactionsScreen } from './screens/Transactions';
import { TxAnalytics } from './screens/TxAnalytics';

/* الدخول والتحقق */
import {
  BootScreen, WelcomeScreen, TermsAcceptScreen, PinCreateScreen, PinConfirmScreen,
  UnlockScreen, TwoFactorScreen, RecoverScreen, FirstWalletScreen,
} from './screens/auth/AuthScreens';

/* الحالات العامة */
import {
  LoadingScreen, EmptyScreen, NoResultsScreen, ErrorScreen, OfflineScreen,
  ForbiddenScreen, SessionExpiredScreen, NotFoundScreen,
} from './screens/states/StateScreens';

/* محرك العقود */
import { ContractsList } from './screens/contracts/ContractsList';
import { ContractSummary } from './screens/contracts/ContractSummary';
import { ContractDraftEdit } from './screens/contracts/ContractDraftEdit';

/* المحافظ والشبكات */
import { TestnetsScreen, CustomNetworkScreen, WalletDetailScreen } from './screens/network/NetworkExtra';
import { WalletImportScreen, WalletConnectScreen } from './screens/wallets/WalletExtra';

/* دفتر العناوين */
import { AddressBookScreen } from './screens/address/AddressBook';
import { AddressCreate, AddressEdit } from './screens/address/AddressForm';

/* الإشعارات والإعدادات والحساب */
import { NotificationsCenter } from './screens/NotificationsCenter';
import { SettingsScreen } from './screens/settings/Settings';
import { ProfileScreen, RolesScreen, SessionsScreen } from './screens/account/Account';
import { ActivityLog, ActivityDetail } from './screens/activity/Activity';

/* المساعدة والدعم */
import { HelpCenter, HelpTopicScreen, SupportScreen, TicketNew, DocScreen } from './screens/help/Help';

function renderScreen(id: ScreenId): ReactNode {
  switch (id) {
    /* الدخول والتحقق */
    case 'boot': return <BootScreen />;
    case 'welcome': return <WelcomeScreen />;
    case 'terms-accept': return <TermsAcceptScreen />;
    case 'pin-create': return <PinCreateScreen />;
    case 'pin-confirm': return <PinConfirmScreen />;
    case 'two-factor': return <TwoFactorScreen />;
    case 'recover': return <RecoverScreen />;
    case 'unlock': return <UnlockScreen />;
    case 'first-wallet': return <FirstWalletScreen />;

    /* الأقسام الرئيسية */
    case 'dashboard': return <Dashboard />;
    case 'contracts': return <ContractsList />;
    case 'engine': return <ContractEngine />;
    case 'contract-summary': return <ContractSummary />;
    case 'contract-draft-edit': return <ContractDraftEdit />;
    case 'mint': return <MintScreen />;
    case 'send': return <SendScreen />;
    case 'wallets': return <WalletsScreen />;
    case 'wallet-detail': return <WalletDetailScreen />;
    case 'wallet-import': return <WalletImportScreen />;
    case 'wallet-connect': return <WalletConnectScreen />;
    case 'network': return <NetworkScreen />;
    case 'network-test': return <TestnetsScreen />;
    case 'network-custom': return <CustomNetworkScreen />;
    case 'transactions': return <TransactionsScreen />;
    case 'analytics': return <TxAnalytics />;
    case 'address-book': return <AddressBookScreen />;
    case 'address-create': return <AddressCreate />;
    case 'address-edit': return <AddressEdit />;
    case 'notifications': return <NotificationsCenter />;
    case 'settings': return <SettingsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'roles': return <RolesScreen />;
    case 'sessions': return <SessionsScreen />;
    case 'activity': return <ActivityLog />;
    case 'activity-detail': return <ActivityDetail />;
    case 'help': return <HelpCenter />;
    case 'help-topic': return <HelpTopicScreen />;
    case 'support': return <SupportScreen />;
    case 'ticket-new': return <TicketNew />;
    case 'terms': return <DocScreen kind="terms" />;
    case 'policies': return <DocScreen kind="policies" />;

    /* الحالات العامة */
    case 'loading': return <LoadingScreen />;
    case 'empty': return <EmptyScreen />;
    case 'no-results': return <NoResultsScreen />;
    case 'error': return <ErrorScreen />;
    case 'offline': return <OfflineScreen />;
    case 'forbidden': return <ForbiddenScreen />;
    case 'session-expired': return <SessionExpiredScreen />;
    case 'not-found': return <NotFoundScreen />;

    default: return <NotFoundScreen />;
  }
}

/* انتقال بين الشاشات: المحتوى القديم ينزلق يميناً ويتلاشى، الجديد ينزلق من اليسار */
function ScreenTransition() {
  const { screen, role, can } = useApp();
  const [current, setCurrent] = useState<ScreenId>(screen);
  const [leaving, setLeaving] = useState<ScreenId | null>(null);

  /* عند تغيير الشاشة: الشاشة القديمة تصبح «مغادرة» والجديدة تصبح «الحالية» */
  useEffect(() => {
    if (screen !== current) {
      setLeaving(current);
      setCurrent(screen);
    }
  }, [screen, current]);

  /* إزالة الشاشة المغادرة بعد انتهاء حركة الانزلاق */
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), 180);
    return () => window.clearTimeout(t);
  }, [leaving]);

  /* منع الوصول لقسم بلا صلاحية — SCR-STATE-NO-PERMISSION */
  const guarded = (id: ScreenId): ReactNode =>
    AUTH_SCREENS.includes(id) || can(id) ? renderScreen(id) : <ForbiddenScreen />;

  return (
    <div className="screen-wrap">
      {leaving && leaving !== current && (
        <div className="screen leaving" key={'l-' + leaving}>
          {guarded(leaving)}
        </div>
      )}
      <div className="screen entering" key={current + role}>
        {guarded(current)}
      </div>
    </div>
  );
}

function Shell() {
  const { screen, locked } = useApp();
  const [mobileNav, setMobileNav] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setBooting(true);
    const t = setTimeout(() => setBooting(false), 320);
    return () => clearTimeout(t);
  }, [screen]);

  /* شاشات بدون هيكل: الدخول والتحقق + انتهاء الجلسة */
  const chromeless = AUTH_SCREENS.includes(screen) || locked;

  if (chromeless) {
    return (
      <div className="app-shell chromeless">
        {booting && <div className="page-progress" />}
        <ScreenTransition />
        <ToastStack />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {booting && <div className="page-progress" />}
      <Sidebar mobileOpen={mobileNav} onCloseMobile={() => setMobileNav(false)} />
      <div className="main-area">
        <Topbar onOpenMobileNav={() => setMobileNav(true)} />
        <ScreenTransition />
      </div>
      <BottomBars />
      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
