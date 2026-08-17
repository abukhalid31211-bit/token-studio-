import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NOTIF_ITEMS, DEFAULT_SETTINGS, CONTRACT_LIST } from '../data/system';
import type { NotifItem, AppSettings, ContractItem } from '../data/system';
import { ADDRESS_BOOK } from '../data/mock';

/* ============================================================
   السياق العام: التنقل الكامل + الرسائل العائمة + الإشعارات
   + الإعدادات + دفتر العناوين + العقود + الحالات العامة
   ============================================================ */

export type ScreenId =
  /* الدخول والتحقق */
  | 'boot'
  | 'welcome'
  | 'terms-accept'
  | 'pin-create'
  | 'pin-confirm'
  | 'two-factor'
  | 'recover'
  | 'unlock'
  | 'first-wallet'
  /* الأقسام الرئيسية */
  | 'dashboard'
  | 'contracts'
  | 'engine'
  | 'contract-summary'
  | 'contract-draft-edit'
  | 'mint'
  | 'send'
  | 'wallets'
  | 'wallet-detail'
  | 'wallet-import'
  | 'wallet-connect'
  | 'network'
  | 'network-test'
  | 'network-custom'
  | 'transactions'
  | 'analytics'
  | 'address-book'
  | 'address-create'
  | 'address-edit'
  | 'notifications'
  | 'settings'
  | 'profile'
  | 'roles'
  | 'sessions'
  | 'activity'
  | 'activity-detail'
  | 'help'
  | 'help-topic'
  | 'support'
  | 'ticket-new'
  | 'terms'
  | 'policies'
  /* الحالات العامة */
  | 'loading'
  | 'empty'
  | 'no-results'
  | 'error'
  | 'offline'
  | 'forbidden'
  | 'session-expired'
  | 'not-found';

export const SCREEN_TITLES: Record<ScreenId, string> = {
  boot: 'الإقلاع',
  welcome: 'الترحيب',
  'terms-accept': 'الموافقة على الشروط',
  'pin-create': 'إنشاء رمز الحماية',
  'pin-confirm': 'تأكيد رمز الحماية',
  'two-factor': 'التحقق بخطوتين',
  recover: 'استعادة الوصول',
  unlock: 'فتح القفل',
  'first-wallet': 'ربط المحفظة الأولى',
  dashboard: 'لوحة التحكم',
  contracts: 'محرك العقود',
  engine: 'إنشاء عقد جديد',
  'contract-summary': 'ملخص العقد',
  'contract-draft-edit': 'تعديل مسودة العقد',
  mint: 'وحدة السك',
  send: 'وحدة الإرسال',
  wallets: 'إدارة المحافظ',
  'wallet-detail': 'تفاصيل المحفظة',
  'wallet-import': 'استيراد محفظة',
  'wallet-connect': 'ربط محفظة خارجية',
  network: 'اختيار الشبكة',
  'network-test': 'شبكات الاختبار',
  'network-custom': 'إضافة شبكة مخصصة',
  transactions: 'سجل المعاملات',
  analytics: 'تحليلات المعاملات',
  'address-book': 'دفتر العناوين',
  'address-create': 'إنشاء جهة عنوان',
  'address-edit': 'تعديل جهة عنوان',
  notifications: 'مركز الإشعارات',
  settings: 'الإعدادات',
  profile: 'الملف الشخصي',
  roles: 'الأدوار والصلاحيات',
  sessions: 'الجلسات النشطة',
  activity: 'سجل النشاط',
  'activity-detail': 'تفاصيل حدث النشاط',
  help: 'مركز المساعدة',
  'help-topic': 'موضوع المساعدة',
  support: 'الدعم والتذاكر',
  'ticket-new': 'إنشاء تذكرة دعم',
  terms: 'شروط الاستخدام',
  policies: 'سياسات الاستخدام',
  loading: 'جارٍ التحميل',
  empty: 'لا توجد بيانات بعد',
  'no-results': 'لا توجد نتائج مطابقة',
  error: 'تعذر إتمام العملية',
  offline: 'لا يوجد اتصال',
  forbidden: 'لا توجد صلاحية',
  'session-expired': 'انتهت الجلسة',
  'not-found': 'مسار غير موجود',
};

/** الشاشات التي تُعرض بدون الهيكل (شريط جانبي + علوي) */
export const AUTH_SCREENS: ScreenId[] = [
  'boot', 'welcome', 'terms-accept', 'pin-create', 'pin-confirm',
  'two-factor', 'recover', 'unlock', 'first-wallet', 'session-expired',
];

export type UserRole = 'owner' | 'operator' | 'viewer';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
}

export interface AddressEntry {
  id: string;
  name: string;
  addr: string;
  short: string;
  net: string;
  note: string;
  lastUsed: string;
  createdAt: string;
}

export interface NavParams {
  contractId?: string;
  walletId?: string;
  addressId?: string;
  activityId?: string;
  topicId?: string;
  ticketId?: string;
  settingsTab?: string;
  txFilter?: string;
  prefillAddr?: string;
  prefillAmount?: string;
  errorCode?: string;
  from?: ScreenId;
}

interface AppState {
  /* التنقل */
  screen: ScreenId;
  params: NavParams;
  go: (s: ScreenId, p?: NavParams) => void;
  back: () => void;
  history: ScreenId[];
  /* الرسائل */
  toasts: Toast[];
  toast: (kind: ToastKind, message: string) => void;
  dismissToast: (id: number) => void;
  /* الإشعارات */
  notifications: NotifItem[];
  unread: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
  pushNotification: (n: Omit<NotifItem, 'id' | 'time' | 'read'>) => void;
  /* الإعدادات */
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  /* الدور */
  role: UserRole;
  setRole: (r: UserRole) => void;
  can: (section: string) => boolean;
  /* دفتر العناوين */
  addresses: AddressEntry[];
  setAddresses: React.Dispatch<React.SetStateAction<AddressEntry[]>>;
  /* العقود */
  contracts: ContractItem[];
  setContracts: React.Dispatch<React.SetStateAction<ContractItem[]>>;
  activeContractId: string;
  setActiveContractId: (id: string) => void;
  /* حالات عامة */
  online: boolean;
  setOnline: (v: boolean) => void;
  batchRunning: { label: string; done: number; total: number } | null;
  setBatchRunning: (v: { label: string; done: number; total: number } | null) => void;
  sessionWarn: boolean;
  setSessionWarn: (v: boolean) => void;
  locked: boolean;
  setLocked: (v: boolean) => void;
  /* الشبكة الافتراضية */
  defaultNetwork: string;
  setDefaultNetwork: (n: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const VALID = Object.keys(SCREEN_TITLES) as ScreenId[];

function readHash(): ScreenId | null {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0] as ScreenId;
  return VALID.includes(h) ? h : null;
}

const STATE_SCREENS = ['loading', 'empty', 'no-results', 'error', 'offline', 'forbidden', 'session-expired', 'not-found'];

const ROLE_SECTION_MAP: Record<UserRole, string[] | 'all'> = {
  owner: 'all',
  operator: ['dashboard', 'contracts', 'engine', 'contract-summary', 'contract-draft-edit', 'mint', 'send', 'wallets', 'wallet-detail', 'wallet-import', 'wallet-connect', 'network', 'network-test', 'network-custom', 'transactions', 'analytics', 'address-book', 'address-create', 'address-edit', 'notifications', 'help', 'help-topic', 'support', 'ticket-new', 'terms', 'policies', 'profile', 'settings', ...STATE_SCREENS],
  viewer: ['dashboard', 'transactions', 'analytics', 'network', 'network-test', 'address-book', 'notifications', 'activity', 'activity-detail', 'help', 'help-topic', 'support', 'terms', 'policies', 'profile', ...STATE_SCREENS],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = readHash();
  const [screen, setScreen] = useState<ScreenId>(initial ?? 'boot');
  const [params, setParams] = useState<NavParams>({});
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<NotifItem[]>(NOTIF_ITEMS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [role, setRole] = useState<UserRole>('owner');
  const [online, setOnline] = useState(true);
  const [batchRunning, setBatchRunning] = useState<{ label: string; done: number; total: number } | null>(null);
  const [sessionWarn, setSessionWarn] = useState(false);
  const [locked, setLocked] = useState(false);
  const [defaultNetwork, setDefaultNetwork] = useState('TRON');
  const [activeContractId, setActiveContractId] = useState('c1');
  const [contracts, setContracts] = useState<ContractItem[]>(CONTRACT_LIST);
  const [addresses, setAddresses] = useState<AddressEntry[]>(
    ADDRESS_BOOK.map((a, i) => ({
      id: 'ab' + (i + 1),
      name: a.name,
      addr: a.addr,
      short: a.short,
      net: a.net,
      note: i === 0 ? 'عميل دائم — تحويلات أسبوعية' : '',
      lastUsed: ['قبل ساعتين', 'أمس', 'قبل 3 أيام'][i] ?? 'لم يُستخدم',
      createdAt: ['2026-08-01', '2026-08-04', '2026-08-09'][i] ?? '2026-08-10',
    })),
  );
  const idRef = useRef(1);

  const go = useCallback((s: ScreenId, p: NavParams = {}) => {
    setHistory((h) => (h[h.length - 1] === s ? h : [...h.slice(-24), s]));
    setParams(p);
    window.location.hash = '/' + s;
    setScreen(s);
    const el = document.querySelector('.screen.entering');
    if (el) el.scrollTop = 0;
  }, []);

  const back = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 2];
      if (prev) {
        window.location.hash = '/' + prev;
        setScreen(prev);
        return h.slice(0, -1);
      }
      window.location.hash = '/dashboard';
      setScreen('dashboard');
      return [];
    });
  }, []);

  useEffect(() => {
    const onHash = () => {
      const h = readHash();
      if (h && h !== screen) setScreen(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [screen]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 320);
  }, []);

  const toastDurationMs = useMemo(() => {
    const n = parseInt(settings.toastDuration, 10);
    return Number.isFinite(n) ? n * 1000 : 3000;
  }, [settings.toastDuration]);

  const toast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = idRef.current++;
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      setTimeout(() => dismissToast(id), toastDurationMs);
    },
    [dismissToast, toastDurationMs],
  );

  const markAllRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))), []);
  const markRead = useCallback((id: string) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x))), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);
  const pushNotification = useCallback((n: Omit<NotifItem, 'id' | 'time' | 'read'>) => {
    setNotifications((list) => [{ ...n, id: 'n' + Date.now(), time: 'الآن', read: false }, ...list]);
  }, []);

  const can = useCallback(
    (section: string) => {
      const allowed = ROLE_SECTION_MAP[role];
      return allowed === 'all' || allowed.includes(section);
    },
    [role],
  );

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Ctx.Provider
      value={{
        screen, params, go, back, history,
        toasts, toast, dismissToast,
        notifications, unread, markAllRead, markRead, clearNotifications, pushNotification,
        settings, setSettings,
        role, setRole, can,
        addresses, setAddresses,
        contracts, setContracts, activeContractId, setActiveContractId,
        online, setOnline, batchRunning, setBatchRunning, sessionWarn, setSessionWarn, locked, setLocked,
        defaultNetwork, setDefaultNetwork,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
