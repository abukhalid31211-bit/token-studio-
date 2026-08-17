import { useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { Toggle, Tabs } from '../../components/ui/primitives';
import { Confetti } from '../../components/ui/Confetti';
import { useApp } from '../../state/AppContext';
import type { EngineConfig } from './ContractEngine';

export function VerifyStep({
  cfg,
  contractAddr,
  onRestart,
}: {
  cfg: EngineConfig;
  contractAddr: string;
  onRestart: () => void;
}) {
  const { go, toast } = useApp();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [tab, setTab] = useState('read');
  const [confetti, setConfetti] = useState(false);
  const timer = useRef<number | null>(null);

  const verify = () => {
    setVerifying(true);
    timer.current = window.setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000);
  };

  const finish = () => {
    setConfetti(true);
    setTimeout(() => {
      setConfetti(false);
      go('mint');
      toast('success', 'تم نشر عقدك بنجاح — ابدأ السك الآن 🎉');
      onRestart();
    }, 1500);
  };

  return (
    <div className="tab-pane" style={{ maxWidth: 760, margin: '0 auto' }}>
      <Confetti run={confetti} />

      <h2 className="section-title">التحقق من كود المصدر</h2>

      <div className="card mb">
        <div className="field">
          <div className="field-label">عنوان العقد</div>
          <div className="input-wrap">
            <input className="input locked mono" value={contractAddr} disabled />
            <span className="input-icons"><span className="lock-icon" style={{ width: 32, height: 32 }}><Icon name="lock" size={14} /></span></span>
          </div>
        </div>

        <div className="field">
          <div className="field-label">إصدار المترجم</div>
          <select className="input" defaultValue={`${cfg.solVersion}+commit.7dd6d404`}>
            <option>{`${cfg.solVersion}+commit.7dd6d404`}</option>
            <option>v0.8.24+commit.e11b9ed9</option>
          </select>
        </div>

        <div className="field">
          <div className="field-label">المحسّن</div>
          <div className="field-row">
            <Toggle on={cfg.optimizer} onChange={() => undefined} />
            <input className="input" style={{ maxWidth: 130 }} value={cfg.runs} readOnly />
            <span className="small muted">تكرارات</span>
          </div>
        </div>

        <div className="field">
          <div className="field-label">إصدار EVM</div>
          <input className="input locked" value={cfg.evm} disabled />
        </div>

        <div className="field">
          <div className="field-label">كود المصدر</div>
          <div className="info-strip"><Icon name="check" size={15} strokeWidth={3} /> مُرفق تلقائياً ✅</div>
        </div>

        <div className="field" style={{ marginBottom: 4 }}>
          <div className="field-label">الترخيص</div>
          <input className="input locked" value={`${cfg.license} License`} disabled />
        </div>
      </div>

      <button type="button" className="btn btn-blue btn-block btn-lg" disabled={verifying || verified} onClick={verify}>
        {verifying ? <span className="spin" style={{ color: '#fff' }} /> : <Icon name="shieldCheck" size={18} />}
        {verifying ? 'جارٍ التحقق...' : verified ? 'تم التحقق ✅' : 'التحقق والنشر'}
      </button>

      {verified && (
        <div style={{ animation: 'expandIn 0.3s ease' }}>
          <div className="field-ok mt" style={{ fontSize: 13.5, justifyContent: 'center' }}>
            ✅ تم التحقق من كود المصدر بنجاح
          </div>

          {/* بطاقة المعاينة */}
          <div className="card mt" style={{ animation: 'screenIn 0.3s ease both' }}>
            <div className="row between mb-sm" style={{ flexWrap: 'wrap', gap: 8 }}>
              <h4 style={{ fontWeight: 800 }}>{cfg.name || 'Token'} ({cfg.symbol || 'TKN'})</h4>
              <span className="badge green"><Icon name="check" size={11} strokeWidth={3.4} /> موثَّق</span>
            </div>
            <Tabs
              mini
              items={[
                { id: 'read', label: 'قراءة العقد' },
                { id: 'write', label: 'كتابة العقد' },
              ]}
              active={tab}
              onChange={setTab}
            />
            {tab === 'read' ? (
              <p className="muted small">الحاملون: 1 — المعاملات: 0 — السعر: غير متاح</p>
            ) : (
              <p className="muted small">دوال الكتابة: mint, burn, transfer, approve — تتطلب اتصال المحفظة</p>
            )}
          </div>

          {/* بطاقة معلومات المقارنة */}
          <div className="card dark mt">
            <div className="kv">
              <span className="k">عنوان العقد:</span>
              <span className="v mono-cell" style={{ color: '#ff8a8a' }}>{contractAddr}</span>
            </div>
            <div className="kv">
              <span className="k">العقد الرسمي للمرجعية:</span>
              <span className="v mono-cell small faint">TR7NHqje...jLj6t</span>
            </div>
            <div className="warn-strip mt-sm">
              <Icon name="warning" size={15} />
              عناوين مختلفة — التحقق من المصدر لا يعني الأصالة
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-block btn-lg mt-lg glow" onClick={finish}>
            ✅ انتهى — الذهاب لوحدة السك
          </button>
        </div>
      )}
    </div>
  );
}
