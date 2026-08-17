/* ============================================================
   بيانات النظام الموسّعة — العقود، الإشعارات، النشاط، المساعدة،
   الجلسات، الأدوار، التذاكر، الوثائق
   (تجريبية بالكامل — واجهة أمامية فقط)
   ============================================================ */

/* ---------------- العقود ---------------- */
export type ContractStatus = 'published' | 'verified' | 'draft';

export interface ContractItem {
  id: string;
  name: string;
  symbol: string;
  address: string;
  network: string;
  netBadge: string;
  status: ContractStatus;
  verified: boolean;
  decimals: number;
  supply: number;
  holders: number;
  createdAt: string;
  updatedAt: string;
  template: string;
  compiler: string;
  owner: string;
}

export const CONTRACT_LIST: ContractItem[] = [
  {
    id: 'c1', name: 'Tether USD', symbol: 'USDT', address: 'TNew7xK2pQm4rLv8sYz1aBcDeFgHiJkLmN', network: 'TRON', netBadge: 'TRC20',
    status: 'verified', verified: true, decimals: 6, supply: 1_010_000_000, holders: 4,
    createdAt: '2026-08-10 09:14', updatedAt: '2026-08-16 15:10', template: 'كامل المميزات', compiler: 'v0.8.19', owner: 'TLa5x...7mKq',
  },
  {
    id: 'c2', name: 'USD Coin', symbol: 'USDC', address: '0x7Cd1eB4f9A8b7C6d5E4f3A2b1C0d9E8f7A6b5C4d', network: 'ETH', netBadge: 'ERC20',
    status: 'published', verified: false, decimals: 6, supply: 250_000_000, holders: 12,
    createdAt: '2026-08-12 11:40', updatedAt: '2026-08-15 08:22', template: 'المتقدم بالسك والحرق', compiler: 'v0.8.20', owner: '0xAbC...3fE2',
  },
  {
    id: 'c3', name: 'Binance USD', symbol: 'BUSD', address: '0xBe39fA2c1D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a', network: 'BSC', netBadge: 'BEP20',
    status: 'published', verified: true, decimals: 18, supply: 90_000_000, holders: 7,
    createdAt: '2026-08-05 16:05', updatedAt: '2026-08-14 19:55', template: 'النسخة الأساسية', compiler: 'v0.8.19', owner: '0xAbC...3fE2',
  },
  {
    id: 'c4', name: 'مسودة — Gold Token', symbol: 'GLD', address: '—', network: 'TRON', netBadge: 'TRC20',
    status: 'draft', verified: false, decimals: 8, supply: 5_000_000, holders: 0,
    createdAt: '2026-08-16 20:31', updatedAt: '2026-08-17 07:02', template: 'القابل للترقية', compiler: 'v0.8.19', owner: 'TLa5x...7mKq',
  },
  {
    id: 'c5', name: 'مسودة — Silver Coin', symbol: 'SLV', address: '—', network: 'POLYGON', netBadge: 'ERC20',
    status: 'draft', verified: false, decimals: 18, supply: 750_000, holders: 0,
    createdAt: '2026-08-17 08:12', updatedAt: '2026-08-17 08:44', template: 'النسخة الأساسية', compiler: 'v0.8.20', owner: 'TLa5x...7mKq',
  },
];

/* ---------------- الإشعارات ---------------- */
export type NotifKind = 'mint' | 'send' | 'deploy' | 'limit' | 'network' | 'fail';

export interface NotifItem {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  target: string;
}

export const NOTIF_ITEMS: NotifItem[] = [
  { id: 'n1', kind: 'mint', title: 'اكتمل السك — 10,000,000 وحدة', body: 'تم سك 10,000,000 USDT على شبكة TRON بنجاح وتأكيد المعاملة.', time: 'قبل 5 دقائق', read: false, target: 'mint' },
  { id: 'n2', kind: 'send', title: 'اكتمل الإرسال — 20/20 مستلم', body: 'انتهى التنفيذ الجماعي لإرسال 200,000 وحدة إلى 20 مستلمًا.', time: 'قبل 12 دقيقة', read: false, target: 'transactions' },
  { id: 'n3', kind: 'deploy', title: 'نجح نشر العقد USDC', body: 'تم نشر العقد على شبكة Ethereum عند العنوان 0x7Cd...1eB4.', time: 'قبل 40 دقيقة', read: false, target: 'contracts' },
  { id: 'n4', kind: 'limit', title: 'تحذير: اقتربت من الحد اليومي', body: 'استُهلك 82% من الحد اليومي للإرسال. يُعاد الضبط عند 00:00.', time: 'قبل ساعة', read: true, target: 'settings' },
  { id: 'n5', kind: 'network', title: 'ازدحام مرتفع على Ethereum', body: 'مستوى الازدحام 78% — قد ترتفع رسوم الغاز بشكل ملحوظ.', time: 'قبل ساعتين', read: true, target: 'network' },
  { id: 'n6', kind: 'fail', title: 'فشلت عملية سك', body: 'رُفضت العملية بسبب تجاوز الحد اليومي المسموح.', time: 'أمس 09:45', read: true, target: 'mint' },
];

/* ---------------- سجل النشاط ---------------- */
export interface ActivityEvent {
  id: string;
  time: string;
  date: string;
  kind: string;
  user: string;
  role: string;
  section: string;
  result: 'success' | 'failed';
  ip: string;
  device: string;
  before: string;
  after: string;
  relatedTx?: string;
}

export const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 'a1', time: '15:10', date: '2026-08-17', kind: 'تنفيذ سك', user: 'المالك', role: 'المالك', section: 'وحدة السك', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: 'الرصيد 9,915,000', after: 'الرصيد 19,915,000', relatedTx: 'tx1' },
  { id: 'a2', time: '14:48', date: '2026-08-17', kind: 'تعديل الإعدادات', user: 'المالك', role: 'المالك', section: 'الإعدادات', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: 'الحد اليومي 3,000,000', after: 'الحد اليومي 5,000,000' },
  { id: 'a3', time: '13:02', date: '2026-08-17', kind: 'إرسال جماعي', user: 'المشغّل', role: 'المشغّل', section: 'وحدة الإرسال', result: 'success', ip: '10.4.30.14', device: 'Safari / macOS', before: '—', after: '20 معاملة مؤكدة', relatedTx: 'tx2' },
  { id: 'a4', time: '11:20', date: '2026-08-17', kind: 'محاولة سك', user: 'المشغّل', role: 'المشغّل', section: 'وحدة السك', result: 'failed', ip: '10.4.30.14', device: 'Safari / macOS', before: '—', after: 'رُفض: تجاوز الحد اليومي' },
  { id: 'a5', time: '09:35', date: '2026-08-17', kind: 'فتح القفل', user: 'المالك', role: 'المالك', section: 'الدخول والتحقق', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: 'مقفل', after: 'جلسة نشطة' },
  { id: 'a6', time: '19:55', date: '2026-08-16', kind: 'نشر عقد', user: 'المالك', role: 'المالك', section: 'محرك العقود', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: 'مسودة', after: 'منشور 0x7Cd...1eB4' },
  { id: 'a7', time: '18:11', date: '2026-08-16', kind: 'ربط محفظة', user: 'المالك', role: 'المالك', section: 'إدارة المحافظ', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: '3 محافظ', after: '4 محافظ' },
  { id: 'a8', time: '16:29', date: '2026-08-16', kind: 'تصدير سجل', user: 'المراقب', role: 'المراقب', section: 'سجل المعاملات', result: 'success', ip: '10.4.44.2', device: 'Edge / Windows', before: '—', after: 'ملف CSV — 128 صفًا' },
  { id: 'a9', time: '12:03', date: '2026-08-16', kind: 'تغيير صلاحيات', user: 'المالك', role: 'المالك', section: 'الحساب والملف الشخصي', result: 'success', ip: '10.4.22.9', device: 'Chrome / Windows', before: 'المراقب: قراءة فقط', after: 'المراقب: قراءة + تصدير' },
  { id: 'a10', time: '08:47', date: '2026-08-15', kind: 'محاولة دخول', user: 'غير معروف', role: '—', section: 'الدخول والتحقق', result: 'failed', ip: '41.90.6.77', device: 'Firefox / Linux', before: '—', after: 'رمز حماية غير صحيح (3 محاولات)' },
];

/* ---------------- الجلسات النشطة ---------------- */
export interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export const SESSIONS: SessionItem[] = [
  { id: 's1', device: 'حاسوب مكتبي', browser: 'Chrome 128 / Windows 11', location: 'صنعاء، اليمن', ip: '10.4.22.9', lastActive: 'الآن', current: true },
  { id: 's2', device: 'هاتف محمول', browser: 'Safari / iOS 18', location: 'صنعاء، اليمن', ip: '10.4.30.14', lastActive: 'قبل 22 دقيقة', current: false },
  { id: 's3', device: 'حاسوب محمول', browser: 'Edge 128 / Windows 11', location: 'عدن، اليمن', ip: '10.4.44.2', lastActive: 'أمس 21:14', current: false },
];

/* ---------------- الأدوار والصلاحيات ---------------- */
export const ROLE_SECTIONS = [
  'لوحة التحكم',
  'محرك العقود',
  'وحدة السك',
  'وحدة الإرسال',
  'إدارة المحافظ',
  'اختيار الشبكة',
  'سجل المعاملات',
  'دفتر العناوين',
  'الإعدادات',
  'سجل النشاط',
];

export const ROLE_ACTIONS = ['العرض', 'الإنشاء', 'التعديل', 'التنفيذ', 'الحذف', 'التصدير'];

export type RoleName = 'owner' | 'operator' | 'viewer';

export const ROLE_LABEL: Record<RoleName, string> = {
  owner: 'المالك',
  operator: 'المشغّل',
  viewer: 'المراقب',
};

export const DEFAULT_ROLE_MATRIX: Record<RoleName, { sections: string[]; actions: string[] }> = {
  owner: { sections: [...ROLE_SECTIONS], actions: [...ROLE_ACTIONS] },
  operator: {
    sections: ['لوحة التحكم', 'محرك العقود', 'وحدة السك', 'وحدة الإرسال', 'إدارة المحافظ', 'اختيار الشبكة', 'سجل المعاملات', 'دفتر العناوين'],
    actions: ['العرض', 'الإنشاء', 'التعديل', 'التنفيذ', 'التصدير'],
  },
  viewer: {
    sections: ['لوحة التحكم', 'سجل المعاملات', 'اختيار الشبكة', 'دفتر العناوين', 'سجل النشاط'],
    actions: ['العرض', 'التصدير'],
  },
};

/* ---------------- مواضيع المساعدة ---------------- */
export interface HelpTopic {
  id: string;
  title: string;
  summary: string;
  icon: string;
  section: string;
  target: string;
  updated: string;
  reads: number;
  steps: string[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'h1', title: 'دليل إنشاء العقد', summary: 'من اختيار القالب حتى توثيق كود المصدر خطوة بخطوة.', icon: 'code',
    section: 'محرك العقود', target: 'engine', updated: '2026-08-12', reads: 1284,
    steps: [
      'افتح محرك العقود من الشريط الجانبي ثم اضغط إنشاء عقد جديد.',
      'اختر نوع القالب المناسب (أساسي، متقدم، كامل المميزات، أو قابل للترقية).',
      'عبّئ معاملات التوكن: الاسم، الرمز، الخانات العشرية، والعرض الأولي.',
      'راجع الكود المولَّد في خطوة معاينة الكود وعدّله عند الحاجة.',
      'شغّل الترجمة وتأكد من خلوها من الأخطاء قبل المتابعة.',
      'انشر العقد على الشبكة المختارة ثم وثّق كود المصدر في المستكشف.',
    ],
  },
  {
    id: 'h2', title: 'دليل السك', summary: 'السك السريع والجماعي وحدود الترخيص اليومية.', icon: 'hammer',
    section: 'وحدة السك', target: 'mint', updated: '2026-08-14', reads: 964,
    steps: [
      'تأكد من العقد النشط في شريط أعلى وحدة السك.',
      'اختر الكمية من الشرائح السريعة أو أدخل كمية مخصصة.',
      'حدّد الوجهة: محفظتي أو عنوان آخر مع التحقق من صحة العنوان.',
      'راجع بطاقة حسابات السك وتأثيرها على الحد اليومي.',
      'اضغط تنفيذ السك وتابع عدّاد التأكيدات حتى الاكتمال.',
    ],
  },
  {
    id: 'h3', title: 'دليل الإرسال', summary: 'الإرسال المنفرد والجماعي واستيراد ملف المستلمين.', icon: 'send',
    section: 'وحدة الإرسال', target: 'send', updated: '2026-08-15', reads: 878,
    steps: [
      'أدخل عنوان المستلم أو اختره من دفتر العناوين.',
      'أدخل الكمية وتأكد من كفاية رصيد التوكن ورسوم الشبكة.',
      'للإرسال الجماعي: استورد ملف المستلمين أو أضف الصفوف يدويًا.',
      'راجع الملخص ثم أكّد بدء التنفيذ.',
      'تابع لوحة التنفيذ الحي واحفظ الإيصال بعد الاكتمال.',
    ],
  },
  {
    id: 'h4', title: 'دليل إدارة المحافظ', summary: 'الاستيراد بالمفتاح الخاص أو عبارة الاسترداد والربط الخارجي.', icon: 'wallet',
    section: 'إدارة المحافظ', target: 'wallets', updated: '2026-08-11', reads: 640,
    steps: [
      'افتح إدارة المحافظ ثم اضغط إضافة محفظة.',
      'اختر الاستيراد بالمفتاح الخاص أو بعبارة الاسترداد (12 أو 24 كلمة).',
      'حدّد شبكة المحفظة واسم العرض ثم احفظ.',
      'يمكنك تعيين أي محفظة كمحفظة رئيسية من قائمة إجراءات البطاقة.',
    ],
  },
  {
    id: 'h5', title: 'دليل الشبكات', summary: 'شبكات التشغيل والاختبار ونقاط الاتصال المخصصة.', icon: 'globe',
    section: 'اختيار الشبكة', target: 'network', updated: '2026-08-13', reads: 512,
    steps: [
      'استعرض بطاقات شبكات التشغيل وحالة كل شبكة.',
      'افتح درج التفاصيل لفحص زمن استجابة نقاط الاتصال.',
      'عيّن الشبكة الافتراضية أو أضف نقطة اتصال مخصصة.',
      'استخدم شبكات الاختبار للتجارب قبل التشغيل الفعلي.',
    ],
  },
  {
    id: 'h6', title: 'دليل الأمان والجلسات', summary: 'رمز الحماية، التحقق بخطوتين، والقفل التلقائي.', icon: 'shield',
    section: 'الإعدادات', target: 'settings', updated: '2026-08-16', reads: 733,
    steps: [
      'افتح الإعدادات ثم تبويب إعدادات الأمان.',
      'غيّر رمز الحماية بإدخال الرمز الحالي ثم الجديد مرتين.',
      'فعّل التحقق بخطوتين والقفل التلقائي عند الخمول.',
      'راجع الجلسات النشطة وأنهِ أي جلسة غير معروفة.',
    ],
  },
];

/* ---------------- تذاكر الدعم ---------------- */
export interface Ticket {
  id: string;
  number: string;
  title: string;
  category: string;
  priority: 'منخفضة' | 'متوسطة' | 'عالية';
  status: 'مفتوحة' | 'قيد المعالجة' | 'مغلقة';
  updated: string;
  created: string;
  body: string;
  replies: { author: string; time: string; text: string }[];
}

export const TICKETS: Ticket[] = [
  {
    id: 't1', number: 'TS-2481', title: 'فشل توثيق كود المصدر على BSC', category: 'محرك العقود', priority: 'عالية',
    status: 'قيد المعالجة', updated: 'قبل 25 دقيقة', created: '2026-08-16 10:20',
    body: 'عند محاولة توثيق العقد على BSC تظهر رسالة عدم تطابق البايت كود رغم تطابق إعدادات المترجم.',
    replies: [
      { author: 'الدعم الفني', time: 'قبل ساعة', text: 'يرجى التأكد من تفعيل المُحسِّن بعدد تشغيلات 200 ونفس إصدار المترجم v0.8.19.' },
      { author: 'أنت', time: 'قبل 25 دقيقة', text: 'الإعدادات مطابقة تمامًا، وأرفقت لقطة من خطوة الترجمة.' },
    ],
  },
  {
    id: 't2', number: 'TS-2470', title: 'طلب رفع الحد اليومي للسك', category: 'الحدود والترخيص', priority: 'متوسطة',
    status: 'مفتوحة', updated: 'أمس 18:40', created: '2026-08-15 18:40',
    body: 'نحتاج رفع الحد اليومي للسك إلى 20,000,000 وحدة لتغطية عملية توزيع مجدولة.',
    replies: [],
  },
  {
    id: 't3', number: 'TS-2402', title: 'بطء في تحميل سجل المعاملات', category: 'سجل المعاملات', priority: 'منخفضة',
    status: 'مغلقة', updated: '2026-08-12 09:05', created: '2026-08-10 14:12',
    body: 'يستغرق الجدول وقتًا طويلًا عند التصفية بتاريخ واسع.',
    replies: [{ author: 'الدعم الفني', time: '2026-08-12 09:05', text: 'تم تحسين الترقيم وتقليل حجم الصفحة الافتراضي. أُغلقت التذكرة.' }],
  },
];

export const TICKET_CATEGORIES = ['محرك العقود', 'وحدة السك', 'وحدة الإرسال', 'إدارة المحافظ', 'الشبكات', 'الحدود والترخيص', 'سجل المعاملات', 'أخرى'];

/* ---------------- الوثائق ---------------- */
export interface DocSection {
  title: string;
  body: string;
}

export const TERMS_DOC: DocSection[] = [
  { title: '1) نطاق الاستخدام', body: 'يمنحك استوديو التوكن واجهة لإدارة العقود الذكية وعمليات السك والإرسال على الشبكات المدعومة. الاستخدام مقتصر على الأغراض المشروعة ووفق الأنظمة السارية في نطاقك القضائي.' },
  { title: '2) مسؤولية المفاتيح', body: 'أنت المسؤول الوحيد عن حفظ المفاتيح الخاصة وعبارات الاسترداد ورمز الحماية. لا يمكن للنظام استرجاع أي مفتاح مفقود، وفقدان العبارة يعني فقدان الوصول نهائيًا.' },
  { title: '3) العمليات على الشبكة', body: 'كل عملية سك أو إرسال أو نشر تُنفَّذ على شبكة لامركزية ولا يمكن التراجع عنها بعد التأكيد. تأكد من صحة العناوين والكميات والشبكة قبل التأكيد.' },
  { title: '4) الحدود والترخيص', body: 'يخضع الحساب لحدود يومية قابلة للتعديل من إعدادات الحدود والترخيص. عند تجاوز الحد تُرفض العملية تلقائيًا مع رسالة تجاوز الحد اليومي.' },
  { title: '5) الأدوار والصلاحيات', body: 'يحدد المالك صلاحيات المشغّل والمراقب. تُسجَّل جميع محاولات الوصول غير المصرح بها في سجل النشاط والتدقيق.' },
  { title: '6) الرسوم', body: 'رسوم الشبكة تُدفع لمشغّلي الشبكة ولا يتقاضاها النظام. التقديرات المعروضة استرشادية وقد تختلف عند التنفيذ حسب الازدحام.' },
  { title: '7) إنهاء الاستخدام', body: 'يمكنك في أي وقت قطع اتصال المحافظ وحذف بيانات النظام المحلية. لا يؤثر ذلك على العقود المنشورة على الشبكة.' },
];

export const POLICIES_DOC: DocSection[] = [
  { title: '1) البيانات المخزّنة محليًا', body: 'تُحفظ تفضيلات العرض ودفتر العناوين وإعدادات الحدود داخل متصفحك فقط. لا تُرسل المفاتيح الخاصة إلى أي خادم.' },
  { title: '2) النسخ الاحتياطي', body: 'ملف النسخة الاحتياطية مشفَّر بكلمة الحماية التي تحددها. فقدان هذه الكلمة يعني تعذّر الاستعادة من الملف.' },
  { title: '3) سجل النشاط', body: 'يُسجَّل نوع الحدث والمستخدم والطابع الزمني والنتيجة لأغراض التدقيق. يمكن تصدير السجل بصيغة CSV أو JSON.' },
  { title: '4) الجلسات', body: 'يمكن إنهاء أي جلسة نشطة من شاشة الجلسات النشطة. يؤدي القفل التلقائي عند الخمول إلى إنهاء الجلسة وطلب رمز الحماية.' },
  { title: '5) الإشعارات', body: 'تُعرض الإشعارات داخل النظام فقط ويمكن ضبط أنواعها من إعدادات الإشعارات، بما في ذلك تجميع الإشعارات المتكررة.' },
  { title: '6) المشاركة مع أطراف ثالثة', body: 'لا تُشارك أي بيانات مع أطراف ثالثة. الاتصال يقتصر على نقاط اتصال الشبكات التي تختارها لعرض حالة الشبكة والأرصدة.' },
];

/* ---------------- الإعدادات الافتراضية ---------------- */
export interface AppSettings {
  language: string;
  numberFormat: string;
  timezone: string;
  compactValues: boolean;
  confirmSensitive: boolean;
  defaultScreen: string;
  autoCopyTx: boolean;
  /* أمان */
  twoFactor: boolean;
  autoLock: boolean;
  autoLockMinutes: string;
  pinBeforeSensitive: boolean;
  /* حدود */
  dailySendLimit: number;
  dailyMintLimit: number;
  maxPerOperation: number;
  maxRecipients: number;
  limitAlert: boolean;
  limitAlertPct: number;
  resetTime: string;
  /* إشعارات */
  notifMint: boolean;
  notifSend: boolean;
  notifDeploy: boolean;
  notifLimit: boolean;
  notifNetwork: boolean;
  notifFail: boolean;
  toastDuration: string;
  groupRepeats: boolean;
  /* نسخ احتياطي */
  backupAddressBook: boolean;
  backupSettings: boolean;
  exportFormat: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'العربية',
  numberFormat: '1,234,567.89',
  timezone: 'آسيا/عدن (GMT+3)',
  compactValues: false,
  confirmSensitive: true,
  defaultScreen: 'لوحة التحكم',
  autoCopyTx: false,
  twoFactor: true,
  autoLock: true,
  autoLockMinutes: '15 دقيقة',
  pinBeforeSensitive: true,
  dailySendLimit: 5_000_000,
  dailyMintLimit: 50_000_000,
  maxPerOperation: 1_000_000,
  maxRecipients: 200,
  limitAlert: true,
  limitAlertPct: 80,
  resetTime: '00:00',
  notifMint: true,
  notifSend: true,
  notifDeploy: true,
  notifLimit: true,
  notifNetwork: true,
  notifFail: true,
  toastDuration: '3 ثوانٍ',
  groupRepeats: true,
  backupAddressBook: true,
  backupSettings: true,
  exportFormat: 'JSON',
};

/* ---------------- الملف الشخصي ---------------- */
export const PROFILE = {
  displayName: 'مالك النظام',
  email: 'owner@token-studio.app',
  phone: '+967 7xx xxx xxx',
  lastLogin: '2026-08-17 09:35',
  createdAt: '2026-08-01',
  installId: 'TS-INST-9F4C-2A17-BE83',
};

/* ---------------- عمليات النسخ الاحتياطي ---------------- */
export const BACKUP_LOG = [
  { id: 'b1', time: '2026-08-16 22:10', kind: 'إنشاء نسخة', size: '48 كيلوبايت', result: 'ناجحة' },
  { id: 'b2', time: '2026-08-12 08:02', kind: 'استعادة نسخة', size: '46 كيلوبايت', result: 'ناجحة' },
  { id: 'b3', time: '2026-08-04 17:44', kind: 'إنشاء نسخة', size: '41 كيلوبايت', result: 'ناجحة' },
];

export const SYSTEM_INFO = {
  name: 'استوديو التوكن — نظام إدارة العقود الذكية',
  version: 'v1.0.0',
  build: '2026.08.17-1',
  lastUpdate: '2026-08-17',
  engine: 'React 19 · TypeScript 5.8 · Vite 7',
};
