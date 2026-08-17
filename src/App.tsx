import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import type { ScreenId } from './state/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastStack } from './components/ui/Toasts';
import { Dashboard } from './screens/Dashboard';
import { ContractEngine } from './screens/engine/ContractEngine';
import { MintScreen } from './screens/Mint';
import { SendScreen } from './screens/Send';
import { WalletsScreen } from './screens/Wallets';
import { NetworkScreen } from './screens/Network';
import { TransactionsScreen } from './screens/Transactions';

function renderScreen(id: ScreenId): ReactNode {
  switch (id) {
    case 'dashboard':
      return <Dashboard />;
    case 'engine':
      return <ContractEngine />;
    case 'mint':
      return <MintScreen />;
    case 'send':
      return <SendScreen />;
    case 'wallets':
      return <WalletsScreen />;
    case 'network':
      return <NetworkScreen />;
    case 'transactions':
      return <TransactionsScreen />;
  }
}

/* انتقال بين الشاشات: المحتوى القديم ينزلق يميناً ويتلاشى، الجديد ينزلق من اليسار */
function ScreenTransition() {
  const { screen } = useApp();
  const [current, setCurrent] = useState<ScreenId>(screen);
  const [leaving, setLeaving] = useState<ScreenId | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (screen !== current) {
      setLeaving(current);
      setCurrent(screen);
      if (timer.current) clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setLeaving(null), 180);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [screen, current]);

  return (
    <div className="screen-wrap">
      {leaving && leaving !== current && (
        <div className="screen leaving" key={'l-' + leaving}>
          {renderScreen(leaving)}
        </div>
      )}
      <div className="screen entering" key={current}>
        {renderScreen(current)}
      </div>
    </div>
  );
}

function Shell() {
  const [mobileNav, setMobileNav] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="app-shell">
      {booting && <div className="page-progress" />}
      <Sidebar mobileOpen={mobileNav} onCloseMobile={() => setMobileNav(false)} />
      <div className="main-area">
        <Topbar onOpenMobileNav={() => setMobileNav(true)} />
        <ScreenTransition />
      </div>
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
