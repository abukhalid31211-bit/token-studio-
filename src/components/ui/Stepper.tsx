import { Icon } from '../../lib/icons';

const STEPS = ['القالب', 'الإعداد', 'الكود', 'الترجمة', 'النشر', 'التحقق'];

/* شريط الخطوات — محرك العقود */
export function Stepper({ current }: { current: number }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'active' : '';
        return (
          <div key={label} className={`step-item ${state}`}>
            <span className="step-circle">{n < current ? <Icon name="check" size={15} strokeWidth={3} /> : n}</span>
            <span className="step-label">{label}</span>
            {n < STEPS.length && <span className="step-line" />}
          </div>
        );
      })}
    </div>
  );
}
