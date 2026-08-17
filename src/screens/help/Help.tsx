import { useMemo, useState } from 'react';
import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { ScreenId } from '../../state/AppContext';
import { Breadcrumb, PageHead, EmptyState, SkeletonList, KV, StatusBadge, ContextMenu, Field, FileDrop } from '../../components/ui/shared';
import { Tabs, Toggle, CopyBtn } from '../../components/ui/primitives';
import { ConfirmModal } from '../../components/ui/Modal';
import { HELP_TOPICS, TICKETS, TICKET_CATEGORIES, TERMS_DOC, POLICIES_DOC } from '../../data/system';
import type { Ticket } from '../../data/system';

/* ============================================================
   مركز المساعدة — SCR-HELP-CENTER
   ============================================================ */
export function HelpCenter() {
  const { go, toast } = useApp();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const list = useMemo(
    () => HELP_TOPICS.filter((t) => !q || `${t.title} ${t.summary} ${t.section}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const popular = [...HELP_TOPICS].sort((a, b) => b.reads - a.reads).slice(0, 4);

  return (
    <div>
      <PageHead
        title="مركز المساعدة"
        sub="أدلة الاستخدام خطوة بخطوة"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث المواضيع'); }, 650); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go('support')}>
              <Icon name="users" size={14} /> الدعم والتذاكر
            </button>
          </>
        }
      />

      <div className="toolbar">
        <div className="input-wrap grow" style={{ maxWidth: 420 }}>
          <input className="input" placeholder="البحث في مواضيع المساعدة..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="input-icons">
            {q ? (
              <button type="button" onClick={() => setQ('')} aria-label="مسح البحث"><Icon name="x" size={14} /></button>
            ) : (
              <button type="button" tabIndex={-1}><Icon name="search" size={14} /></button>
            )}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div>
          {loading ? (
            <SkeletonList rows={4} />
          ) : list.length === 0 ? (
            <EmptyState icon="search" title="لا توجد نتائج مطابقة" hint="جرّب كلمات بحث أخرى أو افتح تذكرة دعم." actionLabel="مسح البحث" onAction={() => setQ('')} secondaryLabel="إنشاء تذكرة دعم" onSecondary={() => go('ticket-new')} />
          ) : (
            <div className="cards-grid">
              {list.map((t) => (
                <button key={t.id} type="button" className="entity-card as-button" onClick={() => go('help-topic', { topicId: t.id })}>
                  <span className="help-icon"><Icon name={t.icon as IconName} size={20} /></span>
                  <h4 className="entity-title">{t.title}</h4>
                  <p className="tiny faint" style={{ minHeight: 34 }}>{t.summary}</p>
                  <div className="entity-meta">
                    <span>{t.section}</span>
                    <span>{t.steps.length} خطوات</span>
                    <span>{t.reads} قراءة</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="zap" size={15} className="green" /> الأكثر قراءة</h4>
            {popular.map((t) => (
              <button key={t.id} type="button" className="link-row" onClick={() => go('help-topic', { topicId: t.id })}>
                <Icon name={t.icon as IconName} size={15} />
                <span className="grow" style={{ textAlign: 'start' }}>{t.title}</span>
                <Icon name="chevLeft" size={14} />
              </button>
            ))}
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="book" size={15} className="green" /> الوثائق</h4>
            <button type="button" className="link-row" onClick={() => go('terms')}><Icon name="file" size={15} /><span className="grow" style={{ textAlign: 'start' }}>شروط الاستخدام</span><Icon name="chevLeft" size={14} /></button>
            <button type="button" className="link-row" onClick={() => go('policies')}><Icon name="shield" size={15} /><span className="grow" style={{ textAlign: 'start' }}>سياسات الاستخدام</span><Icon name="chevLeft" size={14} /></button>
            <button type="button" className="link-row" onClick={() => go('support')}><Icon name="users" size={15} /><span className="grow" style={{ textAlign: 'start' }}>الدعم والتذاكر</span><Icon name="chevLeft" size={14} /></button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="grid" size={15} className="green" /> معرض الحالات العامة</h4>
            <p className="tiny faint" style={{ marginBottom: 10 }}>شاشات الحالة التي يعرضها النظام تلقائيًا عند حدوث ظرف خاص — معروضة هنا للمراجعة.</p>
            <div className="chip-row">
              {([
                ['loading', 'التحميل الأولي'],
                ['empty', 'لا توجد بيانات'],
                ['no-results', 'لا نتائج'],
                ['error', 'خطأ عام'],
                ['offline', 'لا يوجد اتصال'],
                ['forbidden', 'لا توجد صلاحية'],
                ['session-expired', 'انتهت الجلسة'],
                ['not-found', 'مسار غير موجود'],
              ] as const).map(([id, label]) => (
                <button key={id} type="button" className="chip" onClick={() => go(id)}>{label}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   موضوع المساعدة — SCR-HELP-TOPIC
   ============================================================ */
export function HelpTopicScreen() {
  const { params, go, toast } = useApp();
  const topic = HELP_TOPICS.find((t) => t.id === params.topicId) ?? HELP_TOPICS[0];
  const [done, setDone] = useState<number[]>([]);

  if (!topic) return <EmptyState icon="file" title="الموضوع غير موجود" actionLabel="مركز المساعدة" onAction={() => go('help')} />;

  const related = HELP_TOPICS.filter((t) => t.id !== topic.id).slice(0, 3);

  return (
    <div>
      <Breadcrumb items={[{ label: 'مركز المساعدة', to: 'help' }, { label: topic.title }]} />
      <PageHead
        title={topic.title}
        sub={topic.summary}
        backTo="help"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => toast('success', 'تم حفظ الموضوع للمراجعة ✅')}>
              <Icon name="download" size={14} /> حفظ للمراجعة
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go(topic.target as ScreenId)}>
              <Icon name="external" size={14} /> فتح {topic.section}
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div className="card">
          <h4 className="card-title h4"><Icon name="check" size={15} className="green" /> خطوات التنفيذ</h4>
          <ol className="steps-list">
            {topic.steps.map((s, i) => (
              <li key={i} className={done.includes(i) ? 'done' : ''}>
                <button
                  type="button"
                  className="step-check"
                  onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
                  aria-label="تعليم كمنفّذة"
                >
                  {done.includes(i) ? <Icon name="check" size={13} strokeWidth={3.5} /> : i + 1}
                </button>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="progress thin mt">
            <div className="fill" style={{ width: `${(done.length / topic.steps.length) * 100}%` }} />
          </div>
          <div className="tiny faint mt-sm">{done.length} من {topic.steps.length} خطوات مكتملة</div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="info" size={15} className="green" /> عن الموضوع</h4>
            <KV k="القسم المرتبط" v={topic.section} />
            <KV k="آخر تحديث" v={topic.updated} />
            <KV k="عدد القراءات" v={topic.reads} />
            <div className="modal-sep" />
            <button type="button" className="btn btn-sm btn-outline btn-block" onClick={() => go(topic.target as ScreenId)}>الانتقال للقسم</button>
          </div>

          <div className="card tight">
            <h4 className="card-title h4"><Icon name="book" size={15} className="green" /> مواضيع ذات صلة</h4>
            {related.map((t) => (
              <button key={t.id} type="button" className="link-row" onClick={() => { setDone([]); go('help-topic', { topicId: t.id }); }}>
                <Icon name={t.icon as IconName} size={15} />
                <span className="grow" style={{ textAlign: 'start' }}>{t.title}</span>
                <Icon name="chevLeft" size={14} />
              </button>
            ))}
          </div>

          <div className="card tight">
            <p className="muted small mb-sm">لم تجد ما تبحث عنه؟</p>
            <button type="button" className="btn btn-sm btn-primary btn-block" onClick={() => go('ticket-new')}>إنشاء تذكرة دعم</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
   الدعم والتذاكر — SCR-HELP-SUPPORT
   ============================================================ */
export function SupportScreen() {
  const { go, toast } = useApp();
  const [tab, setTab] = useState('open');
  const [tickets, setTickets] = useState(TICKETS);
  const [loading, setLoading] = useState(false);
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);
  const [closeTarget, setCloseTarget] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');

  const list = tickets.filter((t) => (tab === 'open' ? t.status !== 'مغلقة' : t.status === 'مغلقة'));

  return (
    <div>
      <Breadcrumb items={[{ label: 'مركز المساعدة', to: 'help' }, { label: 'الدعم والتذاكر' }]} />
      <PageHead
        title="الدعم والتذاكر"
        sub={`${tickets.filter((t) => t.status !== 'مغلقة').length} تذكرة مفتوحة`}
        backTo="help"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); toast('success', 'تم تحديث قائمة التذاكر'); }, 650); }}>
              <Icon name="refresh" size={14} /> تحديث
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => go('ticket-new')}>
              <Icon name="plus" size={14} strokeWidth={3} /> إنشاء تذكرة دعم
            </button>
          </>
        }
      />

      <Tabs
        items={[
          { id: 'open', label: `التذاكر المفتوحة (${tickets.filter((t) => t.status !== 'مغلقة').length})` },
          { id: 'closed', label: `التذاكر المغلقة (${tickets.filter((t) => t.status === 'مغلقة').length})` },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="tab-pane" key={tab}>
        {loading ? (
          <SkeletonList rows={3} />
        ) : list.length === 0 ? (
          <EmptyState icon="users" title={tab === 'open' ? 'لا توجد تذاكر مفتوحة' : 'لا توجد تذاكر مغلقة'} hint="افتح تذكرة جديدة عند مواجهة أي مشكلة." actionLabel="إنشاء تذكرة دعم" onAction={() => go('ticket-new')} />
        ) : (
          <div className="card table-card">
            {list.map((t) => (
              <div key={t.id} className="list-row">
                <span className={`ticket-priority ${t.priority === 'عالية' ? 'high' : t.priority === 'متوسطة' ? 'mid' : 'low'}`}>{t.priority}</span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <b className="small">{t.title}</b>
                    <StatusBadge status={t.status === 'مفتوحة' ? 'open' : t.status === 'قيد المعالجة' ? 'processing' : 'closed'} />
                  </div>
                  <div className="tiny faint">{t.number} · {t.category} · آخر تحديث: {t.updated}</div>
                </div>
                <button type="button" className="btn btn-xs btn-outline" onClick={() => setOpenTicket(t)}>فتح التذكرة</button>
                <ContextMenu
                  actions={[
                    { label: 'فتح التذكرة', icon: 'eye', onClick: () => setOpenTicket(t) },
                    { label: 'نسخ رقم التذكرة', icon: 'copy', onClick: () => { navigator.clipboard?.writeText(t.number); toast('success', 'تم نسخ رقم التذكرة ✅'); } },
                    { label: 'إغلاق التذكرة', icon: 'x', danger: true, disabled: t.status === 'مغلقة', onClick: () => setCloseTarget(t) },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* درج تفاصيل التذكرة */}
      {openTicket && (
        <div className="ticket-panel-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenTicket(null); }}>
          <aside className="drawer">
            <button type="button" className="modal-close drawer-close" onClick={() => setOpenTicket(null)} aria-label="إغلاق"><Icon name="x" size={15} /></button>
            <h3 className="drawer-title">{openTicket.title}</h3>
            <div className="row mb" style={{ gap: 7, flexWrap: 'wrap' }}>
              <span className="badge gray">{openTicket.number}</span>
              <StatusBadge status={openTicket.status === 'مفتوحة' ? 'open' : openTicket.status === 'قيد المعالجة' ? 'processing' : 'closed'} />
              <span className="badge blue">{openTicket.category}</span>
            </div>
            <div className="card dark tight mb">
              <p className="small">{openTicket.body}</p>
              <div className="tiny faint mt-sm">أُنشئت: {openTicket.created}</div>
            </div>

            <h4 className="card-title h4">الردود</h4>
            {openTicket.replies.length === 0 ? (
              <p className="muted small">لا توجد ردود بعد — فريق الدعم سيرد قريبًا.</p>
            ) : (
              openTicket.replies.map((r, i) => (
                <div key={i} className={`reply ${r.author === 'أنت' ? 'mine' : ''}`}>
                  <div className="row between"><b className="tiny">{r.author}</b><span className="tiny faint">{r.time}</span></div>
                  <p className="small">{r.text}</p>
                </div>
              ))
            )}

            {openTicket.status !== 'مغلقة' && (
              <>
                <Field label="ردّك">
                  <textarea className="input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="اكتب ردك هنا..." />
                </Field>
                <div className="row" style={{ gap: 9 }}>
                  <button
                    type="button"
                    className="btn btn-primary grow"
                    disabled={!reply.trim()}
                    onClick={() => {
                      setTickets((l) => l.map((x) => (x.id === openTicket.id ? { ...x, replies: [...x.replies, { author: 'أنت', time: 'الآن', text: reply }], updated: 'الآن' } : x)));
                      setOpenTicket((t) => (t ? { ...t, replies: [...t.replies, { author: 'أنت', time: 'الآن', text: reply }] } : t));
                      setReply('');
                      toast('success', 'تم إرسال الرد ✅');
                    }}
                  >
                    <Icon name="send" size={14} /> إرسال الرد
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => toast('success', 'تم حفظ مسودة الرد')}>حفظ المسودة</button>
                </div>
                <button type="button" className="btn btn-danger btn-block mt" onClick={() => setCloseTarget(openTicket)}>
                  <Icon name="x" size={14} /> إغلاق التذكرة
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      <ConfirmModal
        open={closeTarget !== null}
        onClose={() => setCloseTarget(null)}
        onConfirm={() => {
          setTickets((l) => l.map((x) => (x.id === closeTarget?.id ? { ...x, status: 'مغلقة' as const, updated: 'الآن' } : x)));
          setOpenTicket(null);
          setCloseTarget(null);
          toast('success', 'تم إغلاق التذكرة ✅');
        }}
        title="إغلاق التذكرة؟"
        confirmLabel="نعم، إغلاق"
        danger
        body={<p className="muted small">سيتم نقل التذكرة <b>{closeTarget?.number}</b> إلى التذاكر المغلقة.</p>}
      />
    </div>
  );
}

/* ============================================================
   إنشاء تذكرة دعم — SCR-HELP-TICKET-NEW
   ============================================================ */
export function TicketNew() {
  const { go, toast } = useApp();
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState(TICKET_CATEGORIES[0]);
  const [prio, setPrio] = useState('متوسطة');
  const [body, setBody] = useState('');
  const [attachSystem, setAttachSystem] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [review, setReview] = useState(false);
  const [sending, setSending] = useState(false);
  const [discard, setDiscard] = useState(false);

  const dirty = !!(title || body || files.length);
  const errTitle = !title.trim() ? 'عنوان التذكرة مطلوب' : null;
  const errBody = body.trim().length < 15 ? 'اكتب وصفًا لا يقل عن 15 حرفًا' : null;

  const send = () => {
    if (errTitle || errBody) return toast('error', 'أكمل الحقول المطلوبة');
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setReview(false);
      toast('success', 'تم إرسال التذكرة ✅ رقمها TS-2492');
      go('support');
    }, 1000);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'الدعم', to: 'support' }, { label: 'إنشاء تذكرة' }]} />
      <PageHead title="إنشاء تذكرة دعم" sub="صف المشكلة بدقة ليتمكن الفريق من مساعدتك بسرعة" backTo="support" />

      <div className="content-grid">
        <div className="card">
          <Field label="عنوان التذكرة" required error={title !== '' && errTitle ? errTitle : null}>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: فشل نشر العقد على شبكة BSC" />
          </Field>

          <div className="grid-2">
            <Field label="تصنيف التذكرة" required>
              <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
                {TICKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="أولوية التذكرة" required>
              <select className="input" value={prio} onChange={(e) => setPrio(e.target.value)}>
                {['منخفضة', 'متوسطة', 'عالية'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <Field label="تفاصيل المشكلة" required error={body !== '' && errBody ? errBody : null} hint="اذكر الخطوات التي أدت للمشكلة والرسائل الظاهرة">
            <textarea className="input" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="صف ما حدث بالتفصيل..." />
          </Field>

          <Field label="مرفقات التذكرة">
            <FileDrop accept="image/*,.txt,.json,.log" hint="صور أو ملفات سجل — حتى 5 ملفات" onFile={(name) => { setFiles((f) => [...f, name].slice(0, 5)); toast('success', 'تمت إضافة المرفق'); }} />
          </Field>

          {files.length > 0 && (
            <div className="attach-list">
              {files.map((f, i) => (
                <span key={i} className="attach-chip">
                  <Icon name="file" size={13} /> {f}
                  <button type="button" onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} aria-label="إزالة المرفق"><Icon name="x" size={11} /></button>
                </span>
              ))}
            </div>
          )}

          <div className="switch-row">
            <div><b className="small">إرفاق بيانات النظام</b><div className="tiny faint">الإصدار، الشبكة النشطة، ومعرّف التثبيت</div></div>
            <Toggle on={attachSystem} onChange={setAttachSystem} />
          </div>

          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary grow" onClick={() => setReview(true)} disabled={!!errTitle || !!errBody}>
              <Icon name="eye" size={15} /> مراجعة قبل الإرسال
            </button>
            <button type="button" className="btn btn-outline" onClick={() => toast('success', 'تم حفظ مسودة التذكرة')}>حفظ المسودة</button>
            <button type="button" className="btn btn-ghost" onClick={() => (dirty ? setDiscard(true) : go('support'))}>إلغاء</button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="eye" size={15} className="green" /> مراجعة التذكرة</h4>
            <KV k="العنوان" v={title || '—'} />
            <KV k="التصنيف" v={cat} />
            <KV k="الأولوية" v={<span className={`ticket-priority ${prio === 'عالية' ? 'high' : prio === 'متوسطة' ? 'mid' : 'low'}`}>{prio}</span>} />
            <KV k="المرفقات" v={files.length} />
            <KV k="بيانات النظام" v={attachSystem ? 'مرفقة' : 'غير مرفقة'} />
          </div>
          <div className="info-strip">
            <Icon name="info" size={15} /> متوسط زمن الرد على التذاكر عالية الأولوية أقل من ساعتين.
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={review}
        onClose={() => setReview(false)}
        onConfirm={send}
        title="تأكيد إرسال التذكرة"
        confirmLabel={sending ? 'جارٍ الإرسال...' : 'نعم، إرسال التذكرة'}
        body={
          <div>
            <KV k="العنوان" v={title} />
            <KV k="التصنيف" v={cat} />
            <KV k="الأولوية" v={prio} />
            <div className="code-block" style={{ maxHeight: 110, marginTop: 10 }}>{body}</div>
          </div>
        }
      />
      <ConfirmModal open={discard} onClose={() => setDiscard(false)} onConfirm={() => { setDiscard(false); go('support'); }} title="إلغاء إنشاء التذكرة؟" confirmLabel="نعم، إلغاء" danger body={<p className="muted small">ستفقد ما كتبته.</p>} />
    </div>
  );
}

/* ============================================================
   الشروط والسياسات — SCR-DOC-TERMS / SCR-DOC-POLICY
   ============================================================ */
export function DocScreen({ kind }: { kind: 'terms' | 'policies' }) {
  const { go, back, toast } = useApp();
  const doc = kind === 'terms' ? TERMS_DOC : POLICIES_DOC;
  const title = kind === 'terms' ? 'شروط الاستخدام' : 'سياسات الاستخدام';
  const [fontSize, setFontSize] = useState(14);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <Breadcrumb items={[{ label: 'المساعدة', to: 'help' }, { label: title }]} />
      <PageHead
        title={title}
        sub="آخر تحديث: 2026-08-17"
        actions={
          <>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setFontSize((s) => (s >= 18 ? 13 : s + 1))}>
              <Icon name="edit" size={14} /> حجم النص ({fontSize})
            </button>
            <CopyBtn text={`${window.location.origin}/#/${kind}`} label="نسخ الرابط" />
            <button type="button" className="btn btn-sm btn-outline" onClick={() => { const text = doc.map((d) => `${d.title}\n${d.body}`).join('\n\n'); const b = new Blob([text], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${kind}.txt`; a.click(); toast('success', 'تم حفظ نسخة من الوثيقة'); }}>
              <Icon name="download" size={14} /> حفظ نسخة
            </button>
          </>
        }
      />

      <div className="content-grid">
        <div className="card">
          <div className="doc-scroll tall" style={{ fontSize }}>
            {doc.map((s) => (
              <div key={s.title} className="doc-item">
                <b>{s.title}</b>
                <p className="muted">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="row mt" style={{ gap: 9 }}>
            <button type="button" className="btn btn-primary" disabled={confirmed} onClick={() => { setConfirmed(true); toast('success', 'تم تأكيد قراءة الوثيقة ✅'); }}>
              <Icon name="check" size={15} /> {confirmed ? 'تم التأكيد' : 'تأكيد القراءة'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={back}>
              <Icon name="arrowRight" size={15} /> رجوع
            </button>
          </div>
        </div>

        <aside className="side-col">
          <div className="card tight">
            <h4 className="card-title h4"><Icon name="book" size={15} className="green" /> بنود الوثيقة</h4>
            {doc.map((s, i) => (
              <div key={s.title} className="link-row static">
                <span className="doc-num">{i + 1}</span>
                <span className="grow small" style={{ textAlign: 'start' }}>{s.title.replace(/^\d+\)\s*/, '')}</span>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-block" onClick={() => go('help')}>
            فتح مركز المساعدة
          </button>
        </aside>
      </div>
    </div>
  );
}
