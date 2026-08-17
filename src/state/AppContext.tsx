import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/* ============================================================
   السياق العام: التنقل بين الشاشات + إشعارات Toast + الإشعارات
   ============================================================ */

export type ScreenId =
  | 'dashboard'
  | 'engine'
  | 'mint'
  | 'send'
  | 'wallets'
  | 'network'
  | 'transactions';

export const SCREEN_TITLES: Record<ScreenId, string> = {
  dashboard: 'لوحة التحكم',
  engine: 'محرك العقود',
  mint: 'وحدة السك',
  send: 'وحدة الإرسال',
  wallets: 'إدارة المحافظ',
  network: 'اختيار الشبكة',
  transactions: 'سجل المعاملات',
};

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
}

interface AppState {
  screen: ScreenId;
  go: (s: ScreenId) => void;
  toasts: Toast[];
  toast: (kind: ToastKind, message: string) => void;
  dismissToast: (id: number) => void;
  unread: number;
  markRead: () => void;
}

const Ctx = createContext<AppState | null>(null);

const VALID: ScreenId[] = ['dashboard', 'engine', 'mint', 'send', 'wallets', 'network', 'transactions'];

function readHash(): ScreenId {
  const h = window.location.hash.replace(/^#\/?/, '') as ScreenId;
  return VALID.includes(h) ? h : 'dashboard';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>(readHash);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unread, setUnread] = useState(2);
  const idRef = useRef(1);

  const go = useCallback((s: ScreenId) => {
    window.location.hash = '/' + s;
    setScreen(s);
  }, []);

  useEffect(() => {
    const onHash = () => setScreen(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 320);
  }, []);

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = idRef.current++;
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      setTimeout(() => dismissToast(id), 3000);
    },
    [dismissToast],
  );

  const markRead = useCallback(() => setUnread(0), []);

  return (
    <Ctx.Provider value={{ screen, go, toasts, toast, dismissToast, unread, markRead }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
