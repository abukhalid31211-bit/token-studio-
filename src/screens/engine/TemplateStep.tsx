import { useState } from 'react';
import { Icon } from '../../lib/icons';
import { TOKEN_TEMPLATES } from '../../data/mock';
import { useApp } from '../../state/AppContext';
import type { EngineConfig } from './ContractEngine';

const TYPES: { id: EngineConfig['templateType']; label: string; tip: string }[] = [
  { id: 'basic', label: 'نسخة أساسية', tip: 'توكن بسيط بوظائف النقل الأساسية فقط' },
  { id: 'advanced', label: 'متقدم (سك وحرق)', tip: 'يضيف دالتي mint و burn للتحكم بالعرض' },
  { id: 'full', label: 'مميزات كاملة', tip: 'سك، حرق، إيقاف، قائمة سوداء وأدوار وصول' },
  { id: 'proxy', label: 'قابل للترقية (Proxy)', tip: 'نشر عبر Proxy يسمح بترقية منطق العقد لاحقاً' },
];

export function TemplateStep({
  cfg,
  update,
  onNext,
}: {
  cfg: EngineConfig;
  update: (p: Partial<EngineConfig>) => void;
  onNext: () => void;
}) {
  const { toast } = useApp();
  const [hoverType, setHoverType] = useState<string | null>(null);

  return (
    <div className="tab-pane">
      <h2 className="section-title">اختر قالب العملة</h2>

      <div className="field">
        <div className="field-label">نوع القالب</div>
        <div className="radio-group horizontal">
          {TYPES.map((t) => (
            <label
              key={t.id}
              className="radio-opt"
              onMouseEnter={() => setHoverType(t.id)}
              onMouseLeave={() => setHoverType(null)}
            >
              <input
                type="radio"
                name="templateType"
                checked={cfg.templateType === t.id}
                onChange={() => update({ templateType: t.id })}
              />
              <span className="r-mark" />
              <span className="r-label">{t.label}</span>
            </label>
          ))}
        </div>
        {hoverType && (
          <div className="field-hint" style={{ animation: 'expandIn 0.18s ease' }}>
            💡 {TYPES.find((t) => t.id === hoverType)?.tip}
          </div>
        )}
      </div>

      {/* شبكة بطاقات القوالب */}
      <div className="tokens-grid mt">
        {TOKEN_TEMPLATES.map((t) => {
          const selected = cfg.templateId === t.id;
          const dimmed = cfg.templateId !== null && !selected;
          return (
            <div
              key={t.id}
              className={`token-card ${selected ? 'selected' : ''} ${dimmed ? 'dimmed' : ''}`}
              onClick={() => {
                update({
                  templateId: t.id,
                  name: t.id === 'CUSTOM' ? '' : t.name,
                  symbol: t.id === 'CUSTOM' ? '' : t.symbol,
                  decimals: t.decimals || 18,
                });
              }}
            >
              {selected && (
                <span className="check-badge"><Icon name="check" size={14} strokeWidth={3.4} /></span>
              )}
              <div className="token-icon" style={{ background: t.color, fontSize: t.icon === '+' ? 30 : 21 }}>
                {t.icon}
              </div>
              <h4>{t.name}</h4>
              <div className="sym">{t.symbol}</div>
              {t.id !== 'CUSTOM' && <div className="meta">خانات عشرية: {t.decimals}</div>}
              <div className="meta">الشبكات: {t.nets}</div>
              <button
                type="button"
                className={`btn btn-sm select-btn ${selected ? 'btn-primary' : 'btn-outline'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  update({
                    templateId: t.id,
                    name: t.id === 'CUSTOM' ? '' : t.name,
                    symbol: t.id === 'CUSTOM' ? '' : t.symbol,
                    decimals: t.decimals || 18,
                  });
                }}
              >
                {selected ? '✓ مُختار' : 'اختيار'}
              </button>
            </div>
          );
        })}
      </div>

      {/* صف الأزرار السفلي */}
      <div className="row between mt-lg">
        <button type="button" className="btn btn-ghost" onClick={() => toast('info', 'تم إلغاء الاختيار')}>
          إلغاء
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!cfg.templateId}
          onClick={onNext}
        >
          التالي <Icon name="arrowLeft" size={15} />
        </button>
      </div>
    </div>
  );
}
