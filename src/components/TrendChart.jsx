import { formatMonth, formatMonthShort } from '../utils/date.js';
import { formatMoney } from '../utils/money.js';

// Written by hand because browsers disagree on compact Indian numbers (some print 80T for 80,000).
const trim = (n) => String(Number(n.toFixed(1)));
function axisLabel(value) {
  if (value >= 1e7) return `₹${trim(value / 1e7)}Cr`;
  if (value >= 1e5) return `₹${trim(value / 1e5)}L`;
  if (value >= 1e3) return `₹${trim(value / 1e3)}K`;
  return `₹${trim(value)}`;
}

// Rounds the tallest bar up to a tidy axis maximum split into four equal steps.
function niceMax(highest) {
  if (highest <= 0) return 4;
  const rough = highest / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((n) => n * power).find((candidate) => candidate >= rough);
  return step * 4;
}

// data: [{ month, income, expense }]. Clicking a month calls onSelect(month).
export default function TrendChart({ data, selectedMonth, onSelect }) {
  const rows = data.map((item) => ({
    month: item.month,
    income: Number(item.income),
    expense: Number(item.expense),
  }));
  const max = niceMax(Math.max(...rows.flatMap((row) => [row.income, row.expense])));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);

  return (
    <div>
      <div className="flex">
        <div className="relative mr-3 h-48 w-12 shrink-0" aria-hidden="true">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 text-xs text-mist tabular-nums"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              {axisLabel(tick)}
            </span>
          ))}
        </div>

        <div className="relative h-48 min-w-0 flex-1">
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden="true"
              className="absolute right-0 left-0 border-t border-[#1e3538]"
              style={{ bottom: `${(tick / max) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex">
            {rows.map((row) => {
              const selected = row.month === selectedMonth;
              return (
                <button
                  key={row.month}
                  type="button"
                  onClick={() => onSelect(row.month)}
                  aria-pressed={selected}
                  aria-label={`${formatMonth(row.month)}: income ${formatMoney(row.income)}, spending ${formatMoney(row.expense)}`}
                  title={`${formatMonth(row.month)}\nIncome ${formatMoney(row.income)}\nSpending ${formatMoney(row.expense)}`}
                  className={`flex h-full min-w-0 flex-1 cursor-pointer items-end justify-center gap-1 px-1 hover:bg-[#13292c] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brass sm:gap-1.5 ${
                    selected ? 'bg-[#13292c]' : ''
                  }`}
                >
                  <span
                    className="block w-3 max-w-6 rounded-t-[2px] bg-income sm:w-5"
                    style={{ height: `${(row.income / max) * 100}%`, minHeight: row.income > 0 ? 2 : 0 }}
                  />
                  <span
                    className="block w-3 max-w-6 rounded-t-[2px] bg-brass sm:w-5"
                    style={{ height: `${(row.expense / max) * 100}%`, minHeight: row.expense > 0 ? 2 : 0 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="mr-3 w-12 shrink-0" />
        <div className="flex min-w-0 flex-1">
          {rows.map((row) => (
            <div
              key={row.month}
              aria-hidden="true"
              className={`flex-1 pt-2 text-center text-sm ${
                row.month === selectedMonth ? 'font-semibold text-bone' : 'text-mist'
              }`}
            >
              {formatMonthShort(row.month)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}