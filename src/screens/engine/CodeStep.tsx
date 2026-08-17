import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../../lib/icons';
import { ConfirmModal } from '../../components/ui/Modal';
import { useApp } from '../../state/AppContext';
import { copyText, parseAmount } from '../../lib/format';
import type { EngineConfig } from './ContractEngine';

/* توليد كود Solidity بناءً على الإعدادات */
function buildCode(cfg: EngineConfig): string {
  const name = cfg.name || 'MyToken';
  const symbol = cfg.symbol || 'MTK';
  const dec = cfg.decimals || 18;
  const supply = parseAmount(cfg.supply) || 1_000_000_000;
  const lines: string[] = [
    `// SPDX-License-Identifier: ${cfg.license}`,
    `pragma solidity ${cfg.solVersion.replace('v', '^')};`,
    '',
    'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
    'import "@openzeppelin/contracts/access/Ownable.sol";',
  ];
  if (cfg.fn.pause) lines.push('import "@openzeppelin/contracts/utils/Pausable.sol";');
  lines.push('');
  const bases = ['ERC20', 'Ownable'];
  if (cfg.fn.pause) bases.push('Pausable');
  lines.push(`contract ${symbol}Token is ${bases.join(', ')} {`);
  lines.push(`    constructor() ERC20("${name}", "${symbol}") Ownable(msg.sender) {`);
  lines.push(`        _mint(msg.sender, ${supply} * 10**${dec});`);
  lines.push('    }');
  lines.push('');
  lines.push('    function decimals() public pure override returns (uint8) {');
  lines.push(`        return ${dec};`);
  lines.push('    }');
  if (cfg.fn.mint) {
    lines.push('');
    lines.push('    function mint(address to, uint256 amount) public onlyOwner {');
    lines.push('        _mint(to, amount);');
    lines.push('    }');
  }
  if (cfg.fn.burn) {
    lines.push('');
    lines.push('    function burn(uint256 amount) public {');
    lines.push('        _burn(msg.sender, amount);');
    lines.push('    }');
  }
  if (cfg.fn.pause) {
    lines.push('');
    lines.push('    function pause() public onlyOwner {');
    lines.push('        _pause();');
    lines.push('    }');
    lines.push('');
    lines.push('    function unpause() public onlyOwner {');
    lines.push('        _unpause();');
    lines.push('    }');
  }
  lines.push('}');
  return lines.join('\n');
}

const KEYWORDS = new Set([
  'pragma', 'solidity', 'import', 'contract', 'is', 'constructor', 'function',
  'public', 'pure', 'view', 'override', 'returns', 'return', 'onlyOwner',
  'address', 'uint256', 'uint8', 'bool', 'string', 'memory',
]);

/* ملوّن بناء الجمل */
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const lines = code.split('\n');
  lines.forEach((line, li) => {
    let rest = line;
    let key = 0;
    const pushTok = (cls: string, text: string) => out.push(<span key={`${li}-${key++}`} className={cls}>{text}</span>);

    while (rest.length) {
      const comment = rest.indexOf('//');
      if (comment === 0) { pushTok('tok-c', rest); rest = ''; break; }
      const strM = rest.match(/^"[^"]*"/);
      if (strM) { pushTok('tok-s', strM[0]); rest = rest.slice(strM[0].length); continue; }
      const idM = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (idM) {
        const w = idM[0];
        if (KEYWORDS.has(w)) pushTok('tok-k', w);
        else if (rest.slice(w.length).startsWith('(')) pushTok('tok-f', w);
        else pushTok('tok-w', w);
        rest = rest.slice(w.length);
        continue;
      }
      const numM = rest.match(/^\d[\d_]*\b/);
      if (numM) { pushTok('tok-t', numM[0]); rest = rest.slice(numM[0].length); continue; }
      pushTok('tok-w', rest[0]);
      rest = rest.slice(1);
    }
    out.push(<span key={`${li}-nl`}>{'\n'}</span>);
  });
  return out;
}

export function CodeStep({
  cfg,
  onBack,
  onNext,
}: {
  cfg: EngineConfig;
  onBack: () => void;
  onNext: () => void;
}) {
  const { toast } = useApp();
  const baseCode = useMemo(() => buildCode(cfg), [cfg]);
  const [code, setCode] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const shown = code ?? baseCode;
  const lineCount = shown.split('\n').length;
  const fnCount = (shown.match(/function /g) || []).length + 1;
  const sizeKb = (new Blob([shown]).size / 1024).toFixed(1);

  const included = [
    '✓ transfer()', '✓ transferFrom()', '✓ approve()', '✓ allowance()',
    '✓ balanceOf()', '✓ totalSupply()',
    ...(cfg.fn.mint ? ['✓ mint() — onlyOwner'] : []),
    ...(cfg.fn.burn ? ['✓ burn()'] : []),
    ...(cfg.fn.pause ? ['✓ pause() / unpause() — onlyOwner'] : []),
    ...(cfg.fn.blacklist ? ['✓ blacklist()'] : []),
    '✓ name()', '✓ symbol()', '✓ decimals()', '✓ owner()',
  ];

  return (
    <div className="tab-pane">
      <div className="content-grid">
        {/* محرر الكود */}
        <div className={`editor ${fullscreen ? 'fullscreen' : ''} ${editing ? 'editing' : ''}`}>
          <div className="editor-toolbar">
            <span className="file-name">{(cfg.symbol || 'TOKEN')}Token.sol</span>
            {fullscreen && (
              <button type="button" className="tool-btn" onClick={() => setFullscreen(false)}>
                <Icon name="minimize" size={13} /> خروج من ملء الشاشة
              </button>
            )}
            <button
              type="button"
              className="tool-btn"
              onClick={() => copyText(shown).then(() => toast('success', 'تم النسخ ✅'))}
            >
              <Icon name="copy" size={13} /> نسخ الكل
            </button>
            <button type="button" className={`tool-btn ${editing ? 'active' : ''}`} onClick={() => setEditing(!editing)}>
              <Icon name="edit" size={13} /> تعديل
            </button>
            <button type="button" className="tool-btn" onClick={() => setResetOpen(true)}>
              <Icon name="refresh" size={13} /> إعادة تعيين
            </button>
            {!fullscreen && (
              <button type="button" className="tool-btn" onClick={() => setFullscreen(true)}>
                <Icon name="maximize" size={13} /> ملء الشاشة
              </button>
            )}
          </div>
          <div className="editor-body">
            <div className="line-nums">
              {shown.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div
              className="code-area"
              contentEditable={editing}
              suppressContentEditableWarning
              spellCheck={false}
              onBlur={(e) => editing && setCode(e.currentTarget.textContent || '')}
            >
              {highlight(shown)}
            </div>
          </div>
        </div>

        {/* اللوحة اليمنى — ملخص الكود */}
        <aside className="side-col">
          <div className="card">
            <h4 className="card-title h4"><Icon name="code" size={15} className="green" /> ملخص الكود</h4>
            <div className="kv"><span className="k">الأسطر:</span><span className="v green">{lineCount}</span></div>
            <div className="kv"><span className="k">الحجم:</span><span className="v">{sizeKb} كيلوبايت</span></div>
            <div className="kv"><span className="k">الدوال:</span><span className="v">{fnCount}</span></div>
            <div className="kv"><span className="k">الأحداث:</span><span className="v">2</span></div>
            <div className="kv"><span className="k">التحذيرات:</span><span className="v green">0</span></div>
            <div className="kv"><span className="k">الأخطاء:</span><span className="v green">0</span></div>
          </div>
          <div className="card">
            <h4 className="card-title h4">الدوال المُضمَّنة</h4>
            <div className="col" style={{ gap: 6 }}>
              {included.map((f) => (
                <span key={f} className="small mono" style={{ color: 'var(--text-2)', textAlign: 'left' }}>{f}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* صف الأزرار السفلي */}
      <div className="row between mt-lg">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <Icon name="arrowRight" size={15} /> رجوع
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          ترجمة <Icon name="arrowLeft" size={15} />
        </button>
      </div>

      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          setCode(null);
          setEditing(false);
          setResetOpen(false);
          toast('info', 'تمت إعادة ضبط الكود المُولَّد 🔄');
        }}
        title="إعادة ضبط الكود المُولَّد؟"
        body={<p className="muted small">ستُفقد أي تعديلات يدوية ويُعاد توليد الكود من الإعدادات.</p>}
        confirmLabel="نعم، إعادة الضبط"
      />
    </div>
  );
}
