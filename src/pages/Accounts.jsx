import { useCallback, useEffect, useState } from 'react';
import AccountDialog from '../components/AccountDialog.jsx';
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from '../services/accountService.js';
import { parseApiError } from '../services/apiError.js';
import { formatMoney } from '../utils/money.js';

const TYPE_LABEL = { CASH: 'Cash', BANK: 'Bank', WALLET: 'Wallet' };

const addButton =
  'cursor-pointer rounded-[7px] bg-brass px-6 font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone';
const textAction =
  'min-h-10 cursor-pointer px-1.5 text-sm font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState(null); // null | { account? }
  const [confirmingId, setConfirmingId] = useState(null);
  const [rowError, setRowError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setAccounts(await getAccounts());
      setStatus('ready');
    } catch (error) {
      setLoadError(parseApiError(error).message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const handleSave = async (payload) => {
    if (dialog.account) {
      const updated = await updateAccount(dialog.account.id, payload);
      setAccounts((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const created = await createAccount(payload);
      setAccounts((list) => [...list, created]);
    }
    setDialog(null);
  };

  const handleDelete = async (id) => {
    setRowError('');
    try {
      await deleteAccount(id);
      setAccounts((list) => list.filter((item) => item.id !== id));
      setConfirmingId(null);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.status === 404) {
        // Already gone (deleted elsewhere): just drop it from the list.
        setAccounts((list) => list.filter((item) => item.id !== id));
        setConfirmingId(null);
      } else {
        setRowError(parsed.message);
      }
    }
  };

  const total = accounts.reduce((sum, item) => sum + Number(item.balance), 0);
  const isEmpty = status === 'ready' && accounts.length === 0;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <h1 className="font-display text-[44px] leading-[1.1] font-normal tracking-[-0.005em]">
          Accounts
        </h1>
        {status === 'ready' && !isEmpty && (
          <button type="button" onClick={() => setDialog({})} className={`h-12 text-base ${addButton}`}>
            Add account
          </button>
        )}
      </div>

      {status === 'loading' && (
        <p role="status" className="mt-11 text-mist">
          Loading your accounts…
        </p>
      )}

      {status === 'error' && (
        <div className="mt-11">
          <p role="alert" className="text-error">
            {loadError}
          </p>
          <button type="button" onClick={load} className={`mt-3 ${textAction} pl-0 text-brass`}>
            Try again
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="mt-18 max-w-120">
          <h2 className="font-display text-[32px] leading-[1.15] font-normal">No accounts yet.</h2>
          <p className="mt-3 max-w-[44ch] text-base leading-[1.6] text-mist">
            Add the places your money lives, such as a bank account, a wallet or cash in hand. Your
            balances and totals will show up here.
          </p>
          <button
            type="button"
            onClick={() => setDialog({})}
            className={`mt-7 block h-13 px-7 text-base ${addButton}`}
          >
            Add your first account
          </button>
        </div>
      )}

      {status === 'ready' && !isEmpty && (
        <>
          <section className="mt-11" aria-label="Total balance">
            <div className="text-sm font-medium text-mist">Total balance</div>
            <div className="mt-1.5 font-display text-[56px] leading-[1.05] tabular-nums">
              {formatMoney(total)}
            </div>
            <div className="mt-1.5 text-sm text-mist">
              Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
            </div>
          </section>

          {rowError && (
            <p role="alert" className="mt-6 text-sm text-error">
              {rowError}
            </p>
          )}

          <ul className="mt-10 border-t border-[#1e3538]">
            {accounts.map((account) => {
              const confirming = confirmingId === account.id;
              return (
                <li
                  key={account.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-8 border-b border-[#1e3538] py-4.5 sm:grid-cols-[1fr_auto_auto]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-lg font-medium">{account.name}</div>
                    <div className="mt-0.5 text-sm text-mist">{TYPE_LABEL[account.type]}</div>
                  </div>
                  <div className="text-right text-xl font-medium tabular-nums">
                    {formatMoney(account.balance)}
                  </div>

                  <div className="col-span-full flex items-center gap-2 sm:col-span-1">
                    {confirming ? (
                      <>
                        <span className="text-sm text-mist">Delete {account.name}?</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(account.id)}
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
                          aria-label={`Edit ${account.name}`}
                          onClick={() => setDialog({ account })}
                          className={textAction}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${account.name}`}
                          onClick={() => {
                            setRowError('');
                            setConfirmingId(account.id);
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
        </>
      )}

      {dialog && (
        <AccountDialog account={dialog.account} onSave={handleSave} onClose={closeDialog} />
      )}
    </>
  );
}