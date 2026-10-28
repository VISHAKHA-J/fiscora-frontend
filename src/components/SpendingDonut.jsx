import { formatMoney } from '../utils/money.js';

// Distinct on the dark pane, none of them the income green.
export const SLICE_COLORS = ['#c9a45c', '#5fa8a0', '#7f9ec9', '#d98f6b', '#b58a9c', '#93a8a4'];

const SIZE = 200;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// slices: [{ key, name, amount, color }]. The centre shows the total.
export default function SpendingDonut({ slices, total }) {
  const sum = slices.reduce((acc, slice) => acc + slice.amount, 0);
  const gap = slices.length > 1 ? 3 : 0;
  let offset = 0;

  const label = `Spending by category: ${slices
    .map((slice) => `${slice.name} ${Math.round((slice.amount / sum) * 100)} percent`)
    .join(', ')}`;

  return (
    <div className="relative size-50 shrink-0">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className="size-full -rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#1e3538" strokeWidth={STROKE} />
        {slices.map((slice) => {
          const length = (slice.amount / sum) * CIRCUMFERENCE;
          const start = offset;
          offset += length;
          return (
            <circle
              key={slice.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={`${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-start}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <div className="text-xs font-medium text-mist">Spent</div>
        <div className="font-display text-[22px] leading-tight tabular-nums">{formatMoney(total)}</div>
      </div>
    </div>
  );
}