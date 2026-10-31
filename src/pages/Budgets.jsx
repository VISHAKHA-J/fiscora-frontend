import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BudgetDialog from '../components/BudgetDialog.jsx';
import BudgetMeter from '../components/BudgetMeter.jsx';
import { parseApiError } from '../services/apiError.js';
import { createBudget, deleteBudget, getBudgets, updateBudget } from '../services/budgetService.js';
import { getCategories } from '../services/categoryService.js';
import { currentMonth, formatMonth } from '../utils/date.js';
import { formatMoney } from '../utils/money.js';

const addButton =
  'cursor-pointer rounded-[7px] bg-brass px-6 font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone';
const textAction =
  'min-h-10 cursor-pointer px-1.5 text-sm font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';
const inlineLink =
  'text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState(null); // null | { budget? }
  const [confirmingId, setConfirmingId] = useState(null);
  const [rowError, setRowError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBudgets(), getCategories()])
      .then(([budgetList, categoryList]) => {
        if (cancelled) return;
        setBudgets(budgetList);
        setCategories(categoryList);
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
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  const budgeted = new Set(budgets.map((item) => item.categoryId));
  const available = categories.filter((item) => item.type === 'EXPENSE' && !budgeted.has(item.id));
  const hasExpenseCategories = categories.some((item) => item.type === 'EXPENSE');
  const isEmpty = status === 'ready' && budgets.length === 0;

  const handleSave = async (payload) => {
    if (dialog.budget) await updateBudget(dialog.budget.id, payload);
    else await createBudget(payload);
    setDialog(null);
    reload();
  };

  const handleDelete = async (id) => {
    setRowError('');
    try {
      await deleteBudget(id);
      setConfirmingId(null);
      reload();
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.status === 404) {
        setConfirmingId(null);
        reload();
      } else {
        setRowError(parsed.message);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <h1 className="font-display text-[44px] leading-[1.1] font-normal tracking-[-0.005em]">Budgets</h1>
        {status === 'ready' && !isEmpty && available.length > 0 && (
          <button type="button" onClick={() => setDialog({})} className={`h-12 text-base ${addButton}`}>
            Add budget
          </button>
        )}
      </div>

      {status === 'loading' && (
        <p role="status" className="mt-11 text-mist">
          Loading your budgets…
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

      {isEmpty && (
        <div className="mt-18 max-w-120">
          <h2 className="font-display text-[32px] leading-[1.15] font-normal">No budgets yet.</h2>
          <p className="mt-3 max-w-[44ch] text-base leading-[1.6] text-mist">
            Set a monthly limit on an expense category, such as Food or Rent, and Fiscora will show how
            much of it you have used.
          </p>
          {hasExpenseCategories ? (
            <button
              type="button"
              onClick={() => setDialog({})}
              className={`mt-7 block h-13 px-7 text-base ${addButton}`}
            >
              Add your first budget
            </button>
          ) : (
            <p className="mt-5 text-base text-mist">
              You need an expense{' '}
              <Link to="/categories" className={inlineLink}>
                category
              </Link>{' '}
              first.
            </p>
          )}
        </div>
      )}

      {status === 'ready' && !isEmpty && (
        <>
          <div className="mt-11 text-sm font-medium text-mist">
            Spending in {formatMonth(currentMonth())}
          </div>

          {rowError && (
            <p role="alert" className="mt-4 text-sm text-error">
              {rowError}
            </p>
          )}

          <ul className="mt-3 border-t border-[#1e3538]">
            {budgets.map((budget) => {
              const confirming = confirmingId === budget.id;
              return (
                <li key={budget.id} className="border-b border-[#1e3538] py-5">
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-medium">{budget.categoryName}</div>
                      <div className="mt-0.5 text-sm text-mist tabular-nums">
                        {formatMoney(budget.spent)} of {formatMoney(budget.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {confirming ? (
                        <>
                          <span className="text-sm text-mist">Delete this budget?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(budget.id)}
                            className={`${textAction} text-error`}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmingId(null);
                              setRowError('');
                            }}
                            className={textAction}
                          >
                            Keep
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            aria-label={`Edit ${budget.categoryName} budget`}
                            onClick={() => setDialog({ budget })}
                            className={textAction}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${budget.categoryName} budget`}
                            onClick={() => {
                              setRowError('');
                              setConfirmingId(budget.id);
                            }}
                            className={textAction}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <BudgetMeter budget={budget} />
                  </div>
                </li>
              );
            })}
          </ul>

          {available.length === 0 && (
            <p className="mt-6 text-sm text-mist">Every expense category already has a budget.</p>
          )}
        </>
      )}

      {dialog && (
        <BudgetDialog
          budget={dialog.budget}
          categories={available}
          onSave={handleSave}
          onClose={closeDialog}
        />
      )}
    </>
  );
}