import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../lib/icons';
import { CopyBtn } from '../../components/ui/primitives';
import { randHex } from '../../lib/format';
import type { EngineConfig } from './ContractEngine';

const PHASES = [
  'تحليل الاستيرادات...',
  'فحص بناء الجمل...',
  'توليد الـ Bytecode...',
  'إنشاء الـ ABI...',
  'تحسين الكود...',
];

const ABI_SAMPLE = `[
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    ...`;

export function CompileStep({
  cfg,
  onBack,
  onNext,
}: {
  cfg: EngineConfig;
  onBack: () => void;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState(0); // عدد المراحل المكتملة
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);
  const bytecode = useRef('0x608060405234801561001057600080fd5b50' + randHex(140));

  useEffect(() => {
    setPhase(0);
    setDone(false);
    PHASES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setPhase(i + 1), 700 * (i + 1)));
    });
    timers.current.push(window.setTimeout(() => setDone(true), 700 * PHASES.length + 500));
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, []);

  return (
    <div className="tab-pane" style={{ maxWidth: 900, margin: '0 auto' }}>
      {!done ? (
        <div className="center" style={{ padding: '44px 0' }}>
          <div className="row" style={{ justifyContent: 'center' }}>
            <span className="spin big" />
          </div>
          <h3 className="mt" style={{ fontSize: 18 }}>جارٍ الترجمة...</h3>

          <div className="status-lines" style={{ maxWidth: 330, margin: '22px auto 0' }}>
            {PHASES.map((p, i) => {
              if (i >= phase + (done ? 1 : 1)) {
                if (i > phase) return null;
              }
              const complete = i < phase;
              const active = i === phase;
              if (!complete && !active) return null;
              return (
                <div className="status-line" key={p}>
                  {complete ? (
                    <span className="ok"><Icon name="check" size={16} strokeWidth={3} /></span>
                  ) : (
                    <span className="pending"><span className="spin" style={{ width: 13, height: 13, borderWidth: 2 }} /></span>
                  )}
                  {p}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="center">
            <div className="big-check success-burst"><Icon name="check" size={42} strokeWidth={3} /></div>
            <h2 className="green mt-sm" style={{ fontSize: 23 }}>تمت الترجمة بنجاح</h2>
          </div>

          <div className="row mt-lg" style={{ gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
            {/* Bytecode */}
            <div className="card grow" style={{ minWidth: 300, animation: 'screenIn 0.3s ease both' }}>
              <div className="row between mb-sm">
                <h4 className="card-title h4" style={{ margin: 0 }}>الـ Bytecode</h4>
                <CopyBtn text={bytecode.current} small label="نسخ" />
              </div>
              <div className="code-block">{bytecode.current}</div>
              <div className="tiny faint mt-sm">الحجم: 4,847 بايت</div>
            </div>

            {/* ABI */}
            <div className="card grow" style={{ minWidth: 300, animation: 'screenIn 0.3s ease 0.1s both' }}>
              <div className="row between mb-sm">
                <h4 className="card-title h4" style={{ margin: 0 }}>الـ ABI</h4>
                <CopyBtn text={ABI_SAMPLE} small label="نسخ" />
              </div>
              <div className="code-block" style={{ color: '#86efac' }}>{ABI_SAMPLE}</div>
              <div className="tiny faint mt-sm">12 دالة</div>
            </div>
          </div>

          <div className="info-strip mt">
            <Icon name="info" size={15} />
            تم تجميع <b>{cfg.symbol || 'Token'}</b> بإصدار {cfg.solVersion} — المحسّن: {cfg.optimizer ? `مُفعَّل (${cfg.runs} تكرار)` : 'معطّل'}
          </div>
        </>
      )}

      <div className="row between mt-lg">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <Icon name="arrowRight" size={15} /> رجوع للكود
        </button>
        <button type="button" className="btn btn-primary" disabled={!done} onClick={onNext}>
          نشر <Icon name="arrowLeft" size={15} />
        </button>
      </div>
    </div>
  );
}
