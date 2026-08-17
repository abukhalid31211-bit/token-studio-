import { useEffect, useState } from 'react';
import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import { CopyBtn, ProgressBar } from '../../components/ui/primitives';
import { SkeletonCards, SkeletonTable } from '../../components/ui/shared';

/* ============================================================
   غلاف موحّد لشاشات الحالات العامة
   ============================================================ */
function StateShell({
  icon,
  tone = 'neutral',
  title,
  sub,
  code,
  children,
  actions,
}: {
  icon: IconName;
  tone?: 'neutral' | 'error' | 'warning' | 'info';
  title: string;
  sub?: string;
  code?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="state-screen">
      <div className={`state-illus ${tone}`}>
        <Icon name={icon} size={40} />
      </div>
      <h2 className="state-title">{title}</h2>
      {sub && <p className="state-sub">{sub}</p>}
      {code && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <span className="code-chip">{code}</span>
          <CopyBtn text={code} small label="نسخ الرمز" />
        </div>
      )}
      {children}
      {actions && <div className="state-actions">{actions}</div>}
    </div>
  );
}

/* شاشة التحميل الأولي — SCR-STATE-LOADING */
export function LoadingScreen() {
  const { go, toast } = useApp();
  const [pct, setPct] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(96, p + 4 + Math.random() * 6)), 220);
    const s = setTimeout(() => setSlow(true), 4500);
    return () => { clearInterval(t); clearTimeout(s); };
  }, []);

  return (
    <div>
      <div className="center mb">
        <h2 className="section-title" style={{ marginBottom: 6 }}>جارٍ التحميل</h2>
        <p className="muted small">يتم جلب البيانات من الشبكة النشطة...</p>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto 26px' }}>
        <ProgressBar pct={pct} />
        <div className="center tiny faint mt-sm">{Math.round(pct)}%</div>
      </div>

      {slow && (
        <div className="warn-strip mb" style={{ maxWidth: 520, margin: '0 auto 20px' }}>
          <Icon name="warning" size={15} /> التحميل يستغرق وقتًا أطول من المعتاد
        </div>
      )}

      <SkeletonCards />
      <SkeletonTable />

      <div className="state-actions">
        <button type="button" className="btn btn-outline" onClick={() => { setPct(0); setSlow(false); toast('info', 'أُعيد تشغيل التحميل'); }}>
          <Icon name="refresh" size={15} /> إعادة تشغيل التحميل
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { toast('warning', 'أُلغي التحميل'); go('dashboard'); }}>
          إلغاء التحميل
        </button>
      </div>
    </div>
  );
}

/* شاشة بدون بيانات — SCR-STATE-EMPTY */
export function EmptyScreen() {
  const { go, toast } = useApp();
  return (
    <StateShell
      icon="file"
      title="لا توجد بيانات بعد"
      sub="ابدأ بإنشاء أول عنصر لتظهر البيانات هنا. يمكنك إنشاء عقد جديد أو تنفيذ أول معاملة."
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={() => go('engine')}>
            <Icon name="plus" size={15} strokeWidth={3} /> إنشاء أول عنصر
          </button>
          <button type="button" className="btn btn-outline" onClick={() => toast('info', 'تم تحديث البيانات')}>
            <Icon name="refresh" size={15} /> تحديث البيانات
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => go('help')}>
            فتح مركز المساعدة
          </button>
        </>
      }
    >
      <div className="info-strip" style={{ maxWidth: 520, margin: '0 auto' }}>
        <Icon name="info" size={15} /> الخطوة التالية: أنشئ عقدًا ثم نفّذ عملية سك أولى
      </div>
    </StateShell>
  );
}

/* شاشة بدون نتائج — SCR-STATE-NORESULT */
export function NoResultsScreen() {
  const { go, toast } = useApp();
  return (
    <StateShell
      icon="search"
      title="لا توجد نتائج مطابقة"
      sub="جرّب تعديل معايير البحث أو مسح الفلاتر للحصول على نتائج أوسع."
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={() => { toast('success', 'تم مسح الفلاتر'); go('transactions'); }}>
            <Icon name="refresh" size={15} /> مسح الفلاتر
          </button>
          <button type="button" className="btn btn-outline" onClick={() => go('transactions')}>
            العودة للقائمة الكاملة
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => go('help')}>
            فتح مركز المساعدة
          </button>
        </>
      }
    >
      <div className="filters-echo">
        <span className="chip">الشبكة: TRON</span>
        <span className="chip">النوع: سك</span>
        <span className="chip">من: 2026-08-01</span>
        <span className="chip">إلى: 2026-08-02</span>
      </div>
    </StateShell>
  );
}

/* شاشة خطأ عام — SCR-STATE-ERROR */
export function ErrorScreen() {
  const { go, params, toast } = useApp();
  const code = params.errorCode ?? 'ERR-5031';
  return (
    <StateShell
      icon="warning"
      tone="error"
      title="تعذر إتمام العملية"
      sub="حدث خطأ غير متوقع أثناء معالجة الطلب. يمكنك إعادة المحاولة أو فتح تذكرة دعم."
      code={code}
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={() => toast('info', 'جارٍ إعادة تنفيذ العملية...')}>
            <Icon name="refresh" size={15} /> إعادة المحاولة
          </button>
          <button type="button" className="btn btn-outline" onClick={() => go('support')}>
            فتح الدعم والتذاكر
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => go('dashboard')}>
            العودة للوحة التحكم
          </button>
        </>
      }
    >
      <div className="error-strip" style={{ maxWidth: 560, margin: '0 auto' }}>
        {code}: upstream node returned an unexpected response (timeout after 30s)
      </div>
    </StateShell>
  );
}

/* شاشة بدون اتصال — SCR-STATE-OFFLINE */
export function OfflineScreen() {
  const { go, setOnline, toast } = useApp();
  const [checking, setChecking] = useState(false);
  return (
    <StateShell
      icon="globe"
      tone="warning"
      title="لا يوجد اتصال"
      sub="تعذر الوصول إلى نقطة الاتصال. تحقق من اتصالك بالإنترنت ثم أعد المحاولة."
      actions={
        <>
          <button
            type="button"
            className="btn btn-primary"
            disabled={checking}
            onClick={() => {
              setChecking(true);
              setTimeout(() => {
                setChecking(false);
                setOnline(true);
                toast('success', 'عاد الاتصال ✅');
                go('dashboard');
              }, 1300);
            }}
          >
            {checking ? <><span className="spin" /> جارٍ الفحص...</> : <><Icon name="refresh" size={15} /> إعادة المحاولة</>}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => go('network')}>
            فتح إعداد الشبكة
          </button>
        </>
      }
    >
      <div className="row" style={{ justifyContent: 'center', gap: 9 }}>
        <span className="dot red pulse" />
        <span className="small bold red">حالة الاتصال: غير متصل</span>
      </div>
    </StateShell>
  );
}

/* شاشة لا توجد صلاحية — SCR-STATE-FORBIDDEN */
export function ForbiddenScreen() {
  const { go, role, setRole, toast } = useApp();
  return (
    <StateShell
      icon="lock"
      tone="warning"
      title="لا توجد صلاحية"
      sub={`دورك الحالي (${role === 'owner' ? 'المالك' : role === 'operator' ? 'المشغّل' : 'المراقب'}) لا يسمح بالوصول إلى هذا القسم. تواصل مع مالك النظام لتعديل الصلاحيات.`}
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={() => go('dashboard')}>
            العودة للوحة التحكم
          </button>
          <button type="button" className="btn btn-outline" onClick={() => go('roles')}>
            عرض الأدوار والصلاحيات
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => { setRole('owner'); toast('success', 'تم التبديل إلى دور المالك'); go('dashboard'); }}
          >
            التبديل لدور المالك
          </button>
        </>
      }
    />
  );
}

/* شاشة انتهاء الجلسة — SCR-STATE-SESSION */
export function SessionExpiredScreen() {
  const { go, setSessionWarn, toast } = useApp();
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <StateShell
          icon="clock"
          tone="warning"
          title="انتهت الجلسة"
          sub="انتهت مدة الجلسة بسبب الخمول. أعد إدخال رمز الحماية لمتابعة العمل من حيث توقفت."
          actions={
            <>
              <button type="button" className="btn btn-primary btn-block" onClick={() => { setSessionWarn(false); go('unlock'); }}>
                <Icon name="lock" size={15} /> إعادة فتح القفل
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={() => { toast('info', 'تم إنهاء الجلسة'); go('welcome'); }}>
                الخروج من النظام
              </button>
            </>
          }
        />
      </div>
    </div>
  );
}

/* شاشة مسار غير موجود — SCR-STATE-404 */
export function NotFoundScreen() {
  const { go } = useApp();
  return (
    <StateShell
      icon="search"
      title="مسار غير موجود"
      sub="الصفحة التي تحاول الوصول إليها غير متاحة أو تم نقلها."
      code="404"
      actions={
        <>
          <button type="button" className="btn btn-primary" onClick={() => go('dashboard')}>
            العودة للوحة التحكم
          </button>
          <button type="button" className="btn btn-outline" onClick={() => go('help')}>
            فتح مركز المساعدة
          </button>
        </>
      }
    />
  );
}
