import { Icon } from '../../lib/icons';
import { Accordion, Toggle } from '../../components/ui/primitives';
import { parseAmount } from '../../lib/format';
import type { EngineConfig } from './ContractEngine';

const FN_ROWS: { key: keyof EngineConfig['fn'] | 'base'; name: string; desc: string; locked?: boolean }[] = [
  { key: 'base', name: 'transfer / transferFrom / approve', desc: 'دوال النقل الأساسية', locked: true },
  { key: 'mint', name: 'mint()', desc: 'يتيح إنشاء وحدات جديدة' },
  { key: 'burn', name: 'burn()', desc: 'يتيح حرق الوحدات وتقليل العرض' },
  { key: 'pause', name: 'pause() / unpause()', desc: 'إيقاف النقل مؤقتاً في الطوارئ' },
  { key: 'blacklist', name: 'blacklist()', desc: 'منع عناوين محددة من التعامل' },
  { key: 'renounce', name: 'renounceOwnership()', desc: 'التخلي عن ملكية العقد نهائياً' },
];

export function ConfigStep({
  cfg,
  update,
  onBack,
  onNext,
}: {
  cfg: EngineConfig;
  update: (p: Partial<EngineConfig>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const isCustom = cfg.templateId === 'CUSTOM';
  const supplyNum = parseAmount(cfg.supply);
  const supplyValid = cfg.supply.trim() !== '' && supplyNum > 0;

  return (
    <div className="tab-pane" style={{ maxWidth: 860 }}>
      <h2 className="section-title">معاملات التوكن</h2>

      {/* القسم الأول — المعلومات الأساسية */}
      <div className="card mb">
        <h3 className="card-title">المعلومات الأساسية</h3>

        <div className="field">
          <div className="field-label">اسم التوكن</div>
          <div className="input-wrap">
            <input
              className="input locked"
              value={cfg.name}
              disabled={!isCustom}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="اسم التوكن..."
            />
            {!isCustom && (
              <span className="input-icons"><span className="lock-icon" data-tip="مأخوذ تلقائياً من القالب" style={{ width: 32, height: 32 }}><Icon name="lock" size={14} /></span></span>
            )}
          </div>
        </div>

        <div className="field">
          <div className="field-label">رمز التوكن</div>
          <div className="input-wrap">
            <input
              className="input locked"
              value={cfg.symbol}
              disabled={!isCustom}
              onChange={(e) => update({ symbol: e.target.value.toUpperCase() })}
              placeholder="SYMBOL"
            />
            {!isCustom && (
              <span className="input-icons"><span className="lock-icon" data-tip="مأخوذ تلقائياً من القالب" style={{ width: 32, height: 32 }}><Icon name="lock" size={14} /></span></span>
            )}
          </div>
        </div>

        <div className="field">
          <div className="field-label">الخانات العشرية</div>
          <div className="input-wrap">
            <input className="input locked" value={cfg.decimals} disabled />
            <span className="input-icons"><span className="lock-icon" data-tip="مأخوذ تلقائياً من القالب" style={{ width: 32, height: 32 }}><Icon name="lock" size={14} /></span></span>
          </div>
        </div>

        <div className="field">
          <div className="field-label">العرض الأولي</div>
          <input
            className={`input ${supplyValid ? 'valid' : cfg.supply ? 'invalid' : ''}`}
            value={cfg.supply}
            onChange={(e) => update({ supply: e.target.value })}
            inputMode="numeric"
          />
          {!supplyValid && cfg.supply.trim() !== '' && (
            <div className="field-error"><Icon name="warning" size={12} /> أدخل رقماً صحيحاً أكبر من صفر</div>
          )}
          <div className="field-hint">إجمالي الوحدات التي تُنشأ عند النشر</div>
        </div>
      </div>

      {/* القسم الثاني — الدوال */}
      <div className="card mb">
        <h3 className="card-title">الدوال المُفعَّلة</h3>
        {FN_ROWS.map((row) => (
          <div className="fn-row" key={row.key} data-tip={row.desc}>
            <span className="fn-name">{row.name}</span>
            {row.locked ? (
              <>
                <Toggle on disabled />
                <span className="badge gray">إلزامي</span>
              </>
            ) : (
              <Toggle
                on={cfg.fn[row.key as keyof EngineConfig['fn']]}
                onChange={(v) => update({ fn: { ...cfg.fn, [row.key]: v } })}
              />
            )}
          </div>
        ))}
      </div>

      {/* القسم الثالث — صلاحيات الوصول */}
      <div className="card mb">
        <h3 className="card-title">صلاحيات الوصول</h3>

        <div className="field">
          <div className="field-label">من يستطيع السك؟</div>
          <div className="radio-group">
            <label className="radio-opt">
              <input type="radio" checked={cfg.access === 'owner'} onChange={() => update({ access: 'owner' })} />
              <span className="r-mark" />
              <span className="r-label">المالك فقط (onlyOwner)</span>
            </label>
            <label className="radio-opt">
              <input type="radio" checked={cfg.access === 'roles'} onChange={() => update({ access: 'roles' })} />
              <span className="r-mark" />
              <span className="r-label">وصول قائم على الأدوار (Role-Based)</span>
            </label>
            <label className="radio-opt">
              <input type="radio" checked={cfg.access === 'none'} onChange={() => update({ access: 'none' })} />
              <span className="r-mark" />
              <span className="r-label">بلا قيود</span>
              <Icon name="warning" size={15} className="yellow" />
            </label>
          </div>
          {cfg.access === 'none' && (
            <div className="warn-strip mt-sm"><Icon name="warning" size={14} /> أي شخص سيتمكن من سك وحدات جديدة — خيار غير آمن!</div>
          )}
        </div>

        <div className="field">
          <div className="field-label">الحد الأقصى للعرض</div>
          <div className="field-row">
            <input
              className="input"
              value={cfg.maxSupply}
              disabled={cfg.unlimited}
              onChange={(e) => update({ maxSupply: e.target.value })}
              inputMode="numeric"
            />
            <Toggle on={cfg.unlimited} onChange={(v) => update({ unlimited: v })} label="غير محدود" />
          </div>
        </div>
      </div>

      {/* القسم الرابع — الإعدادات المتقدمة */}
      <div className="mb">
        <Accordion title="إعدادات متقدمة">
          <div className="field mt-sm">
            <div className="field-label">إصدار Solidity</div>
            <select className="input" value={cfg.solVersion} onChange={(e) => update({ solVersion: e.target.value })}>
              {['v0.8.19', 'v0.8.24', 'v0.8.26', 'v0.8.28'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <div className="field-label">المحسِّن (Optimizer)</div>
            <div className="field-row">
              <Toggle on={cfg.optimizer} onChange={(v) => update({ optimizer: v })} />
              <input
                className="input"
                style={{ maxWidth: 140 }}
                value={cfg.runs}
                disabled={!cfg.optimizer}
                onChange={(e) => update({ runs: e.target.value })}
              />
              <span className="small muted">تكرارات</span>
            </div>
          </div>
          <div className="field">
            <div className="field-label">إصدار EVM</div>
            <select className="input" value={cfg.evm} onChange={(e) => update({ evm: e.target.value })}>
              {['Paris', 'Shanghai', 'Cancun'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="field">
            <div className="field-label">الترخيص</div>
            <select className="input" value={cfg.license} onChange={(e) => update({ license: e.target.value })}>
              {['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </Accordion>
      </div>

      {/* صف الأزرار السفلي */}
      <div className="row between">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
        <button type="button" className="btn btn-primary" disabled={!supplyValid || (isCustom && (!cfg.name || !cfg.symbol))} onClick={onNext}>
          التالي <Icon name="arrowLeft" size={15} />
        </button>
      </div>
    </div>
  );
}
