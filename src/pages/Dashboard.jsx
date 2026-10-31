import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseApiError } from '../services/apiError.js';
import { getDashboardSummary, getTrend } from '../services/dashboardService.js';
import { currentMonth, formatDate, formatMonth, shiftMonth } from '../utils/date.js';
import { formatMoney } from '../utils/money.js';
import SpendingDonut, { SLICE_COLORS } from '../components/SpendingDonut.jsx';
import TrendChart from '../components/TrendChart.jsx';
import BudgetMeter from '../components/BudgetMeter.jsx';
import { getBudgets } from '../services/budgetService.js';


const textAction =
  'min-h-10 cursor-pointer px-1.5 text-sm font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';
const inlineLink =
  'text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass';
const arrowButton =
  'grid size-10 cursor-pointer place-items-center text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:cursor-default disabled:opacity-30 disabled:hover:text-mist';

function Stat({ label, value, tone = 'text-bone' }) {
  return (
    <div>
      <div className="text-sm font-medium text-mist">{label}</div>
      <div className={`mt-1.5 font-display text-[32px] leading-[1.1] tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const thisMonth = currentMonth();
  const [month, setMonth] = useState(thisMonth);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getDashboardSummary(month)
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(parseApiError(error).message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);


    // Last six months, for the chart. A failure here never hides the rest of the page.
  const [trend, setTrend] = useState(null);
  const [trendFailed, setTrendFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setTrendFailed(false);
    getTrend(6)
      .then((data) => !cancelled && setTrend(data))
      .catch(() => !cancelled && setTrendFailed(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);



    // Budgets for the month being viewed. Like the trend, a failure here stays quiet.
  const [budgets, setBudgets] = useState([]);
  useEffect(() => {
    let cancelled = false;
    getBudgets(month)
      .then((list) => !cancelled && setBudgets(list))
      .catch(() => !cancelled && setBudgets([]));
    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);


  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const expense = summary ? Number(summary.expense) : 0;
  const net = summary ? Number(summary.net) : 0;
    // Top five categories get their own slice; everything else is grouped as "Other".
  const slices = (() => {
    const list = summary ? summary.expenseByCategory : [];
    const shown = list.length > 6 ? list.slice(0, 5) : list;
    const result = shown.map((item, index) => ({
      key: item.categoryId,
      name: item.categoryName,
      amount: Number(item.amount),
      color: SLICE_COLORS[index],
    }));
    if (list.length > 6) {
      const rest = list.slice(5).reduce((acc, item) => acc + Number(item.amount), 0);
      result.push({ key: 'other', name: 'Other', amount: rest, color: SLICE_COLORS[5] });
    }
    return result;
  })();
  const hasAnyData = summary && (summary.recentTransactions.length > 0 || Number(summary.totalBalance) !== 0);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <h1 className="font-display text-[44px] leading-[1.1] font-normal tracking-[-0.005em]">
          Dashboard
        </h1>

        <div className="flex items-center" role="group" aria-label="Month">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            className={arrowButton}
          >
            ‹
          </button>
          <span className="min-w-36 text-center text-base font-medium" aria-live="polite">
            {formatMonth(month)}
          </span>
          <button
            type="button"
            aria-label="Next month"
            disabled={month >= thisMonth}
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            className={arrowButton}
          >
            ›
          </button>
        </div>
      </div>

      {status === 'loading' && !summary && (
        <p role="status" className="mt-11 text-mist">
          Loading your dashboard…
        </p>
      )}

      {status === 'error' && (
        <div className="mt-11">
          <p role="alert" className="text-error">
            {loadError}
          </p>
          <button type="button" onClick={reload} className={`mt-3 ${textAction} pl-0 text-brass`}>
            Try again
          </button>
        </div>
      )}

      {summary && status !== 'error' && (
        <div className={status === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <section className="mt-11" aria-label="Total balance">
            <div className="text-sm font-medium text-mist">Total balance</div>
            <div className="mt-1.5 font-display text-[56px] leading-[1.05] tabular-nums">
              {formatMoney(summary.totalBalance)}
            </div>
            <div className="mt-1.5 text-sm text-mist">Across all your accounts</div>
          </section>

          {!hasAnyData && (
            <p className="mt-8 max-w-[52ch] text-base leading-[1.6] text-mist">
              Nothing here yet. Start by adding an{' '}
              <Link to="/accounts" className={inlineLink}>
                account
              </Link>
              , then record a{' '}
              <Link to="/transactions" className={inlineLink}>
                transaction
              </Link>
              .
            </p>
          )}

          <section
            className="mt-10 grid grid-cols-1 gap-6 border-t border-[#1e3538] pt-6 sm:grid-cols-3"
            aria-label={`Summary for ${formatMonth(month)}`}
          >
            <Stat label="Income" value={formatMoney(summary.income)} tone="text-income" />
            <Stat label="Spending" value={formatMoney(summary.expense)} />
            <Stat
              label="Net"
              value={`${net > 0 ? '+' : net < 0 ? '−' : ''}${formatMoney(Math.abs(net))}`}
              tone={net > 0 ? 'text-income' : 'text-bone'}
            />
          </section>


                    <section className="mt-12" aria-labelledby="trend-title">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 id="trend-title" className="text-sm font-medium text-mist">
                Last 6 months
              </h2>
              <div className="flex items-center gap-5 text-sm text-mist" aria-hidden="true">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-[2px] bg-income" /> Income
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-[2px] bg-brass" /> Spending
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-[#1e3538] pt-6">
              {trendFailed ? (
                <p className="text-[15px] text-mist">Couldn't load the trend. Refresh to try again.</p>
              ) : !trend ? (
                <p role="status" className="text-[15px] text-mist">
                  Loading…
                </p>
              ) : trend.every((row) => Number(row.income) === 0 && Number(row.expense) === 0) ? (
                <p className="text-[15px] text-mist">No income or spending in the last 6 months.</p>
              ) : (
                <TrendChart data={trend} selectedMonth={month} onSelect={setMonth} />
              )}
            </div>
          </section>


          <section className="mt-12" aria-labelledby="by-category-title">
            <h2 id="by-category-title" className="text-sm font-medium text-mist">
              Where it went in {formatMonth(month)}
            </h2>

            {summary.expenseByCategory.length === 0 ? (
              <p className="mt-3 border-t border-[#1e3538] pt-4 text-[15px] text-mist">
                No spending recorded this month.
              </p>
            ) : (
                            <div className="mt-4 flex flex-col items-center gap-8 border-t border-[#1e3538] pt-6 sm:flex-row sm:items-center">
                <SpendingDonut slices={slices} total={expense} />

                <ul className="w-full min-w-0 flex-1">
                  {slices.map((slice) => (
                    <li
                      key={slice.key}
                      className="flex items-center gap-3 border-b border-[#1e3538] py-3 first:pt-0 last:border-b-0"
                    >
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-base font-medium">{slice.name}</span>
                      <span className="text-base font-medium tabular-nums">{formatMoney(slice.amount)}</span>
                      <span className="w-10 text-right text-sm text-mist tabular-nums">
                        {Math.round((slice.amount / expense) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {budgets.length > 0 && (
            <section className="mt-12" aria-labelledby="budgets-title">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="budgets-title" className="text-sm font-medium text-mist">
                  Budgets in {formatMonth(month)}
                </h2>
                <Link to="/budgets" className={`text-sm ${inlineLink}`}>
                  Manage
                </Link>
              </div>

              <ul className="mt-3 border-t border-[#1e3538]">
                {[...budgets]
                  .sort((a, b) => Number(b.percentUsed) - Number(a.percentUsed))
                  .map((budget) => (
                    <li key={budget.id} className="border-b border-[#1e3538] py-4">
                      <div className="flex items-baseline justify-between gap-6">
                        <span className="min-w-0 truncate text-base font-medium">{budget.categoryName}</span>
                        <span className="text-sm text-mist tabular-nums">
                          {formatMoney(budget.spent)} of {formatMoney(budget.amount)}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <BudgetMeter budget={budget} />
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <section className="mt-12" aria-labelledby="recent-title">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="recent-title" className="text-sm font-medium text-mist">
                Recent transactions
              </h2>
              {summary.recentTransactions.length > 0 && (
                <Link to="/transactions" className={`text-sm ${inlineLink}`}>
                  View all
                </Link>
              )}
            </div>

            {summary.recentTransactions.length === 0 ? (
              <p className="mt-3 border-t border-[#1e3538] pt-4 text-[15px] text-mist">
                No transactions yet.
              </p>
            ) : (
              <ul className="mt-3 border-t border-[#1e3538]">
                {summary.recentTransactions.map((item) => {
                  const income = item.type === 'INCOME';
                  const detail = [item.note, item.accountName].filter(Boolean).join(' · ');
                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-x-6 border-b border-[#1e3538] py-3.5 sm:grid-cols-[6.5rem_1fr_auto]"
                    >
                      <div className="col-span-full mb-1 text-sm text-mist sm:col-span-1 sm:mb-0">
                        {formatDate(item.date)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-medium">{item.categoryName}</div>
                        {detail && <div className="mt-0.5 truncate text-sm text-mist">{detail}</div>}
                      </div>
                      <div
                        className={`text-right text-lg font-medium tabular-nums ${
                          income ? 'text-income' : 'text-bone'
                        }`}
                      >
                        {income ? '+' : '−'}
                        {formatMoney(item.amount)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}