import { useState } from 'react';
import { Icon } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { UserRole } from '../../state/AppContext';
import { Breadcrumb, PageHead, Field, UnsavedBar, KV, EmptyState, SkeletonList } from '../../components/ui/shared';
import { ConfirmModal } from '../../components/ui/Modal';
import { PROFILE, SESSIONS, ROLE_SECTIONS, ROLE_ACTIONS, DEFAULT_ROLE_MATRIX, ROLE_LABEL, ACTIVITY_EVENTS } from '../../data/system';
import type { RoleName } from '../../data/system';

/* ============================================================
   شاشة الملف الشخصي — SCR-ACC-PROFILE
   ============================================================ */
export function ProfileScreen() {
  const { go, toast, role, setRole, setLocked } = useApp();
  const [name, setName] = useState(PROFILE.displayName);
  const [email, setEmail] = useState(PROFILE.email);
  const [phone, setPhone] = useState(PROFILE.phone);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [discard, setDiscard] = useState(false);

  const emailErr = email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'صيغة البريد غير صحيحة' : null;

  const save = () => {
    if (!name.trim()) return toast('error', 'اسم العرض مطلوب');
    if (emailErr) return toast('error', 'تحقق من بريد التواصل');
    setSaving(true);
    setTimeout(() => { setSaving(false); setDirty(false); toast('success', 'تم حفظ الملف الشخصي ✅'); }, 700);
  };

  const myEvents = ACTIVITY_EVENTS.filter((e) => e.user === ROLE_LABEL[role as RoleName]).slice(0, 4);

  return (
    <div style={{ paddingBottom: dirty ? 70 : 0 }}>
      <PageHead
        title="الملف الشخصي"
        sub="بيانات الحساب والصلاحيات والجلسات"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم تحديث بيانات الحساب')}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setLockOpen(true)}>
              <Icon name="lock" size={14} /> قفل النظام
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div className="card">
          <div className="profile-head">
            <span className="avatar-circle lg">{name.slice(0, 2)}</span>
            <div>
              <b>{name}</b>
              <div className="row" style={{ gap: 7 }}>
                <span className="badge green">{ROLE_LABEL[role as RoleName]}</span>
                <span className="tiny faint">منذ {PROFILE.createdAt}</span>
              </div>
            </div>
          </div>
          <div className="modal-sep" />

          <Field label="اسم العرض" required error={!name.trim() ? 'الاسم مطلوب' : null}>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} />
          </Field>
          <div className="grid-2">
            <Field label="بريد التواصل" error={emailErr}>
              <input className={`input ${emailErr ? 'invalid' : ''}`} value={email} onChange={(e) => { setEmail(e.target.value); setDirty(true); }} dir="ltr" />
            </Field>
            <Field label="رقم التواصل">
              <input className="input" value={phone} onChange={(e) => { setPhone(e.target.value); setDirty(true); }} dir="ltr" />
            </Field>
          </div>

          <div className="modal-sep" />
          <Field label="الدور الحالي (تبديل تجريبي للمعاينة)" hint="يغيّر ما تراه من أقسام وصلاحيات">
            <select className="input" value={role} onChange={(e) => { setRole(e.target.value as UserRole); toast('info', `تم التبديل إلى دور ${ROLE_LABEL[e.target.value as RoleName]}`); }}>
              <option value="owner">المالك</option>
              <option value="operator">المشغّل</option>
              <option value="viewer">المراقب</option>
            </select>
          </Field>

          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary grow" onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : <Icon name="check" size={15} />} حفظ الملف الشخصي
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => (dirty ? setDiscard(true) : go('dashboard'))}>إلغاء</button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="shield" size={15} className="green" /> صلاحيات الحساب</h4>
            <KV k="نوع المستخدم" v={ROLE_LABEL[role as RoleName]} />
            <KV k="الأقسام المتاحة" v={DEFAULT_ROLE_MATRIX[role as RoleName].sections.length} />
            <KV k="الإجراءات المسموحة" v={DEFAULT_ROLE_MATRIX[role as RoleName].actions.length} />
            <div className="modal-sep" />
            <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('roles')}>إدارة الأدوار والصلاحيات</button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> آخر دخول</h4>
            <KV k="التاريخ" v={PROFILE.lastLogin} />
            <KV k="الجهاز" v="Chrome / Windows" />
            <div className="modal-sep" />
            <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go('sessions')}>الجلسات النشطة</button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="file" size={15} className="green" /> آخر عمليات الحساب</h4>
            <div className="timeline">
              {(myEvents.length ? myEvents : ACTIVITY_EVENTS.slice(0, 4)).map((e) => (
                <div key={e.id} className="tl-item">
                  <span className={`tl-dot ${e.result === 'success' ? 'green' : 'red'}`} />
                  <div><b className="small">{e.kind}</b><div className="tiny faint">{e.date} · {e.time}</div></div>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-sm btn-ghost btn-block mt-sm" onClick={() => go('activity')}>فتح سجل النشاط</button>
          </div>
        </aside>
      </div>

      <UnsavedBar show={dirty} onSave={save} onCancel={() => setDiscard(true)} saving={saving} />

      <ConfirmModal open={discard} onClose={() => setDiscard(false)} onConfirm={() => { setName(PROFILE.displayName); setEmail(PROFILE.email); setPhone(PROFILE.phone); setDirty(false); setDiscard(false); }} title="إلغاء التعديلات؟" confirmLabel="نعم، إلغاء" danger />
      <ConfirmModal
        open={lockOpen}
        onClose={() => setLockOpen(false)}
        onConfirm={() => { setLockOpen(false); setLocked(true); toast('info', 'تم قفل النظام'); go('unlock'); }}
        title="قفل النظام؟"
        confirmLabel="نعم، قفل الآن"
        danger
        body={<p className="muted small">سيُطلب منك إدخال رمز الحماية عند العودة.</p>}
      />
    </div>
  );
}

/* ============================================================
   شاشة الأدوار والصلاحيات — SCR-ACC-ROLES
   ============================================================ */
export function RolesScreen() {
  const { toast, go } = useApp();
  const [matrix, setMatrix] = useState(DEFAULT_ROLE_MATRIX);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toggleSection = (role: RoleName, section: string) => {
    if (role === 'owner') return toast('warning', 'لا يمكن تعديل صلاحيات المالك');
    setMatrix((m) => {
      const has = m[role].sections.includes(section);
      return { ...m, [role]: { ...m[role], sections: has ? m[role].sections.filter((s) => s !== section) : [...m[role].sections, section] } };
    });
    setDirty(true);
  };

  const toggleAction = (role: RoleName, action: string) => {
    if (role === 'owner') return toast('warning', 'لا يمكن تعديل صلاحيات المالك');
    setMatrix((m) => {
      const has = m[role].actions.includes(action);
      return { ...m, [role]: { ...m[role], actions: has ? m[role].actions.filter((a) => a !== action) : [...m[role].actions, action] } };
    });
    setDirty(true);
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setDirty(false); setConfirmOpen(false); toast('success', 'تم حفظ الصلاحيات ✅'); }, 700);
  };

  const roles: RoleName[] = ['owner', 'operator', 'viewer'];

  return (
    <div style={{ paddingBottom: dirty ? 70 : 0 }}>
      <Breadcrumb items={[{ label: 'الحساب', to: 'profile' }, { label: 'الأدوار والصلاحيات' }]} />
      <PageHead
        title="الأدوار والصلاحيات"
        sub="تحديد الأقسام المتاحة والإجراءات المسموحة لكل دور"
        backTo="profile"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setMatrix(DEFAULT_ROLE_MATRIX); setDirty(true); toast('info', 'تمت استعادة الصلاحيات الافتراضية'); }}>
              <Icon name="refresh" size={14} /> استعادة الافتراضي
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setConfirmOpen(true)} disabled={!dirty}>
              <Icon name="check" size={14} /> حفظ الصلاحيات
            </button>
          </>
        }
      />

      <div className="card table-card mb">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>القسم</th>
                {roles.map((r) => <th key={r} className="center-cell">{ROLE_LABEL[r]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ROLE_SECTIONS.map((s) => (
                <tr key={s}>
                  <td><b className="small">{s}</b></td>
                  {roles.map((r) => (
                    <td key={r} className="center-cell">
                      <label className={`check-box ${r === 'owner' ? 'locked' : ''}`}>
                        <input type="checkbox" checked={matrix[r].sections.includes(s)} disabled={r === 'owner'} onChange={() => toggleSection(r, s)} />
                        <span className="c-mark"><Icon name="check" size={11} strokeWidth={3.5} /></span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="card-title h3" style={{ fontSize: 16 }}>الإجراءات المسموحة</h3>
      <div className="card table-card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>الإجراء</th>{roles.map((r) => <th key={r} className="center-cell">{ROLE_LABEL[r]}</th>)}</tr>
            </thead>
            <tbody>
              {ROLE_ACTIONS.map((a) => (
                <tr key={a}>
                  <td><b className="small">{a}</b></td>
                  {roles.map((r) => (
                    <td key={r} className="center-cell">
                      <label className={`check-box ${r === 'owner' ? 'locked' : ''}`}>
                        <input type="checkbox" checked={matrix[r].actions.includes(a)} disabled={r === 'owner'} onChange={() => toggleAction(r, a)} />
                        <span className="c-mark"><Icon name="check" size={11} strokeWidth={3.5} /></span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-strip mt">
        <Icon name="info" size={15} /> أثر التغيير: {roles.filter((r) => r !== 'owner').map((r) => `${ROLE_LABEL[r]} — ${matrix[r].sections.length} قسم / ${matrix[r].actions.length} إجراء`).join(' · ')}
      </div>

      <div className="row mt" style={{ gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={() => go('profile')}>العودة للملف الشخصي</button>
      </div>

      <UnsavedBar show={dirty} onSave={() => setConfirmOpen(true)} onCancel={() => { setMatrix(DEFAULT_ROLE_MATRIX); setDirty(false); }} saving={saving} />

      <ConfirmModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={save} title="تأكيد تغيير الصلاحيات" confirmLabel="نعم، حفظ" body={<p className="muted small">سيؤثر التغيير فورًا على ما يراه المشغّل والمراقب.</p>} />
    </div>
  );
}

/* ============================================================
   شاشة الجلسات النشطة — SCR-ACC-SESSIONS
   ============================================================ */
export function SessionsScreen() {
  const { toast, go } = useApp();
  const [sessions, setSessions] = useState(SESSIONS);
  const [loading, setLoading] = useState(false);
  const [endTarget, setEndTarget] = useState<string | null>(null);
  const [endAll, setEndAll] = useState(false);
  const [duration, setDuration] = useState('30 دقيقة');

  const others = sessions.filter((s) => !s.current);

  return (
    <div>
      <Breadcrumb items={[{ label: 'الحساب', to: 'profile' }, { label: 'الجلسات النشطة' }]} />
      <PageHead
        title="الجلسات النشطة"
        sub={`${sessions.length} جلسة نشطة على حسابك`}
        backTo="profile"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث قائمة الجلسات'); }, 650); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => setEndAll(true)} disabled={others.length === 0}>
              <Icon name="logout" size={14} /> إنهاء كل الجلسات الأخرى
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div>
          {loading ? (
            <SkeletonList rows={3} />
          ) : (
            <div className="card table-card">
              {sessions.map((s) => (
                <div key={s.id} className="list-row">
                  <span className={`session-icon ${s.current ? 'current' : ''}`}>
                    <Icon name={s.device.includes('هاتف') ? 'qr' : 'grid'} size={17} />
                  </span>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <b className="small">{s.device}</b>
                      {s.current && <span className="badge green">الجلسة الحالية</span>}
                    </div>
                    <div className="tiny faint">{s.browser}</div>
                    <div className="tiny faint">{s.location} · {s.ip}</div>
                  </div>
                  <span className="tiny faint hide-sm">آخر نشاط: {s.lastActive}</span>
                  <button type="button" className="btn btn-xs btn-danger" disabled={s.current} onClick={() => setEndTarget(s.id)}>
                    <Icon name="x" size={12} /> إنهاء
                  </button>
                </div>
              ))}
              {others.length === 0 && (
                <div style={{ padding: 20 }}>
                  <EmptyState icon="users" title="لا توجد جلسات أخرى" hint="أنت متصل من هذا الجهاز فقط." />
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="users" size={15} className="green" /> ملخص الجلسات</h4>
            <KV k="إجمالي الجلسات" v={sessions.length} />
            <KV k="الجلسة الحالية" v="1" />
            <KV k="جلسات أخرى" v={others.length} tone={others.length ? 'yellow' : 'green'} />
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="clock" size={15} className="green" /> مدة الجلسة</h4>
            <Field label="الإنهاء التلقائي عند الخمول">
              <select className="input" value={duration} onChange={(e) => setDuration(e.target.value)}>
                {['15 دقيقة', '30 دقيقة', 'ساعة', '4 ساعات'].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <button type="button" className="btn btn-sm btn-primary btn-block" onClick={() => toast('success', 'تم حفظ تفضيل إنهاء الجلسات الخاملة ✅')}>
              حفظ التفضيل
            </button>
          </div>

          <button type="button" className="btn btn-ghost btn-block" onClick={() => go('activity')}>فتح سجل النشاط</button>
        </aside>
      </div>

      <ConfirmModal
        open={endTarget !== null}
        onClose={() => setEndTarget(null)}
        onConfirm={() => { setSessions((l) => l.filter((x) => x.id !== endTarget)); setEndTarget(null); toast('success', 'تم إنهاء الجلسة ✅'); }}
        title="إنهاء الجلسة المحددة؟"
        confirmLabel="نعم، إنهاء"
        danger
        body={<p className="muted small">سيُسجَّل خروج هذا الجهاز فورًا.</p>}
      />
      <ConfirmModal
        open={endAll}
        onClose={() => setEndAll(false)}
        onConfirm={() => { setSessions((l) => l.filter((x) => x.current)); setEndAll(false); toast('success', 'تم إنهاء كل الجلسات الأخرى ✅'); }}
        title="إنهاء كل الجلسات الأخرى؟"
        confirmLabel="نعم، إنهاء الكل"
        danger
        body={<p className="muted small">ستبقى جلسة هذا الجهاز فقط نشطة.</p>}
      />
    </div>
  );
}
