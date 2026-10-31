import { formatMoney } from '../utils/money.js';

// Colour is never the only signal: the caption always says it in words too.
const STATUS = {
  OK: { bar: 'bg-income', label: 'Within budget' },
  NEAR: { bar: 'bg-brass', label: 'Nearly used' },
  OVER: { bar: 'bg-error', label: 'Over budget' },
};

// Progress bar plus a one-line caption for a BudgetResponse.
export default function BudgetMeter({ budget }) {
  const { bar, label } = STATUS[budget.status];
  const percent = Number(budget.percentUsed);
  const spent = Number(budget.spent);
  const over = budget.status === 'OVER';
  const width = Math.min(percent, 100);

  return (
    <div>
      <div
        role="progressbar"
        aria-label={`${budget.categoryName} budget`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width)}
        aria-valuetext={`${formatMoney(budget.spent)} of ${formatMoney(budget.amount)}. ${label}.`}
        className="h-1.5 bg-[#1e3538]"
      >
        <div className={`h-full ${bar}`} style={{ width: `${width}%`, minWidth: spent > 0 ? 3 : 0 }} />
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4 text-sm">
        <span className={over ? 'font-medium text-error' : 'text-mist'}>
          {over
            ? `${formatMoney(Math.abs(Number(budget.remaining)))} over`
            : `${formatMoney(budget.remaining)} left`}
        </span>
        <span className="text-mist tabular-nums">
          {Math.round(percent)}% · {label}
        </span>
      </div>
    </div>
  );
}