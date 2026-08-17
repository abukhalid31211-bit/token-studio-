import { Icon } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import { useApp } from '../../state/AppContext';
import type { ToastKind } from '../../state/AppContext';

const ICONS: Record<ToastKind, IconName> = {
  success: 'check',
  error: 'x',
  warning: 'warning',
  info: 'info',
};

/* إشعارات Toast — يمين أسفل، تتكدس عمودياً */
export function ToastStack() {
  const { toasts } = useApp();
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind} ${t.leaving ? 'out' : ''}`}>
          <Icon name={ICONS[t.kind]} size={16} strokeWidth={2.6} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
