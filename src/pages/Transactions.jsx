import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DateField from '../components/DateField.jsx';
import SelectField from '../components/SelectField.jsx';
import TransactionDialog from '../components/TransactionDialog.jsx';
import { getAccounts } from '../services/accountService.js';
import { parseApiError } from '../services/apiError.js';
import { getCategories } from '../services/categoryService.js';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../services/transactionService.js';
import { formatDate } from '../utils/date.js';
import { formatMoney } from '../utils/money.js';

const NO_FILTERS = { accountId: '', categoryId: '', from: '', to: '' };

const addButton =
  'cursor-pointer rounded-[7px] bg-brass px-6 font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone';
const textAction =
  'min-h-10 cursor-pointer px-1.5 text-sm font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';
const inlineLink =
  'text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass';

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState(null); // null | { transaction? }
  const [confirmingId, setConfirmingId] = useState(null);
  const [rowError, setRowError] = useState('');

  // Accounts and categories feed the dropdowns. Loaded once, with the first list.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getAccounts(), getCategories()])
      .then(([accountList, categoryList]) => {
        if (cancelled) return;
        setAccounts(accountList);
        setCategories(categoryList);
      })
      .catch(() => {}); // the list request below reports connection problems
    return () => {
      cancelled = true;
    };
  }, []);

  // The list reloads whenever a filter changes or reload() is called.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getTransactions(filters)
      .then((list) => {
        if (cancelled) return;
        setTransactions(list);
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
  }, [filters, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const setFilter = (name) => (event) =>
    setFilters((current) => ({ ...current, [name]: event.target.value }));

  const hasFilters = Object.values(filters).some(Boolean);
  const needsSetup = accounts.length === 0 || categories.length === 0;
  const noneAtAll = status === 'ready' && transactions.length === 0 && !hasFilters;

  const handleSave = async (payload) => {
    if (dialog.transaction) await updateTransaction(dialog.transaction.id, payload);
    else await createTransaction(payload);
    setDialog(null);
    reload();
  };

  const handleDelete = async (id) => {
    setRowError('');
    try {
      await deleteTransaction(id);
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

  const showAddButton = !needsSetup && !noneAtAll && status !== 'error';

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <h1 className="font-display text-[44px] leading-[1.1] font-normal tracking-[-0.005em]">
          Transactions
        </h1>
        {showAddButton && (
          <button type="button" onClick={() => setDialog({})} className={`h-12 text-base ${addButton}`}>
            Add transaction
          </button>
        )}
      </div>

      {needsSetup && status !== 'loading' && (
        <p className="mt-8 max-w-[52ch] text-base leading-[1.6] text-mist">
          Before you can add a transaction you need at least one{' '}
          <Link to="/accounts" className={inlineLink}>
            account
          </Link>{' '}
          and one{' '}
          <Link to="/categories" className={inlineLink}>
            category
          </Link>
          .
        </p>
      )}

      {!noneAtAll && status !== 'error' && (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <SelectField
            id="filter-account"
            label="Account"
            compact
            className=""
            value={filters.accountId}
            onChange={setFilter('accountId')}
            options={accounts.map((item) => ({ value: String(item.id), label: item.name }))}
            placeholder="All accounts"
          />
          <SelectField
            id="filter-category"
            label="Category"
            compact
            className=""
            value={filters.categoryId}
            onChange={setFilter('categoryId')}
            options={categories.map((item) => ({ value: String(item.id), label: item.name }))}
            placeholder="All categories"
          />
          <DateField
            id="filter-from"
            label="From"
            compact
            className=""
            value={filters.from}
            max={filters.to || undefined}
            onChange={setFilter('from')}
          />
          <DateField
            id="filter-to"
            label="To"
            compact
            className=""
            value={filters.to}
            min={filters.from || undefined}
            onChange={setFilter('to')}
          />
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => setFilters(NO_FILTERS)}
          className={`mt-3 pl-0 text-brass ${textAction}`}
        >
          Clear filters
        </button>
      )}

      {rowError && (
        <p role="alert" className="mt-6 text-sm text-error">
          {rowError}
        </p>
      )}

      {status === 'loading' && transactions.length === 0 && (
        <p role="status" className="mt-11 text-mist">
          Loading your transactions…
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

      {noneAtAll && !needsSetup && (
        <div className="mt-18 max-w-120">
          <h2 className="font-display text-[32px] leading-[1.15] font-normal">No transactions yet.</h2>
          <p className="mt-3 max-w-[44ch] text-base leading-[1.6] text-mist">
            Record what you earn and what you spend. Your account balances will update as you go.
          </p>
          <button
            type="button"
            onClick={() => setDialog({})}
            className={`mt-7 block h-13 px-7 text-base ${addButton}`}
          >
            Add your first transaction
          </button>
        </div>
      )}

      {status === 'ready' && transactions.length === 0 && hasFilters && (
        <p className="mt-10 border-t border-[#1e3538] pt-5 text-base text-mist">
          No transactions match these filters.
        </p>
      )}

      {transactions.length > 0 && status !== 'error' && (
        <ul className="mt-6 border-t border-[#1e3538]">
          {transactions.map((item) => {
            const confirming = confirmingId === item.id;
            const income = item.type === 'INCOME';
            const detail = [item.note, item.accountName].filter(Boolean).join(' · ');
            return (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 border-b border-[#1e3538] py-4 sm:grid-cols-[6.5rem_1fr_auto_auto]"
              >
                <div className="col-span-full mb-1 text-sm text-mist sm:col-span-1 sm:mb-0">
                  {formatDate(item.date)}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg font-medium">{item.categoryName}</div>
                  {detail && <div className="mt-0.5 truncate text-sm text-mist">{detail}</div>}
                </div>

                <div
                  className={`text-right text-xl font-medium tabular-nums ${
                    income ? 'text-income' : 'text-bone'
                  }`}
                >
                  {income ? '+' : '−'}
                  {formatMoney(item.amount)}
                </div>

                <div className="col-span-full flex items-center gap-2 sm:col-span-1">
                  {confirming ? (
                    <>
                      <span className="text-sm text-mist">Delete this?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
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
                        aria-label={`Edit ${item.categoryName} on ${formatDate(item.date)}`}
                        onClick={() => setDialog({ transaction: item })}
                        className={textAction}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.categoryName} on ${formatDate(item.date)}`}
                        onClick={() => {
                          setRowError('');
                          setConfirmingId(item.id);
                        }}
                        className={textAction}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dialog && (
        <TransactionDialog
          transaction={dialog.transaction}
          accounts={accounts}
          categories={categories}
          onSave={handleSave}
          onClose={closeDialog}
        />
      )}
    </>
  );
}