import { useEffect, useRef, useState } from 'react';
import TextField from './TextField.jsx';
import { parseApiError } from '../services/apiError.js';

const TYPES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'WALLET', label: 'Wallet' },
];

// One dialog for both add and edit. Pass `account` to edit (no opening balance then).
// `onSave(payload)` should return a promise; throw to show the error here.
export default function AccountDialog({ account, onSave, onClose }) {
  const isEdit = Boolean(account);
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState(account?.type ?? 'BANK');
  const [openingBalance, setOpeningBalance] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const trimmed = name.trim();
    if (!trimmed) nextErrors.name = 'Enter a name for this account.';

    const balanceText = openingBalance.trim();
    if (!isEdit && balanceText && !/^\d+(\.\d{1,2})?$/.test(balanceText)) {
      nextErrors.openingBalance = 'Use numbers only, with up to two decimals.';
    }
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) return;

    const payload = isEdit
      ? { name: trimmed, type }
      : { name: trimmed, type, openingBalance: balanceText ? Number(balanceText) : 0 };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.status === 409) setErrors({ name: parsed.message });
      else if (Object.keys(parsed.fieldErrors).length) setErrors(parsed.fieldErrors);
      else setFormError(parsed.message);
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(4,10,11,0.76)] p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
        onSubmit={handleSubmit}
        noValidate
        className="max-h-full w-full max-w-110 overflow-y-auto rounded border border-[#243c3f] bg-pane p-9"
      >
        <h2 id="account-dialog-title" className="font-display text-[32px] leading-[1.15]">
          {isEdit ? 'Edit account' : 'Add an account'}
        </h2>
        <p className="mt-1.5 text-[15px] leading-normal text-mist">
          A bank account, a wallet or cash in hand.
        </p>

        <TextField
          id="account-name"
          label="Name"
          ref={nameRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          maxLength={100}
          autoComplete="off"
        />

        <fieldset className="mt-6 min-w-0 border-0 p-0">
          <legend className="p-0 text-sm font-medium text-mist">Type</legend>
          <div className="mt-1.5 flex">
            {TYPES.map((option) => {
              const selected = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setType(option.value)}
                  className={`flex-1 cursor-pointer bg-transparent py-3 text-base hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                    selected
                      ? 'border-b-2 border-brass pb-[11px] font-semibold text-brass'
                      : 'border-b border-rule font-medium text-mist'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {!isEdit && (
          <div className="mt-6">
            <label htmlFor="account-balance" className="block text-sm font-medium text-mist">
              Opening balance
            </label>
            <div
              className={`mt-1 flex items-baseline gap-2 border-b ${
                errors.openingBalance ? 'border-error' : 'border-rule'
              } focus-within:border-brass`}
            >
              <span className="text-lg font-medium text-mist">₹</span>
              <input
                id="account-balance"
                inputMode="decimal"
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                aria-describedby="account-balance-note"
                aria-invalid={errors.openingBalance ? 'true' : undefined}
                className="block min-w-0 flex-1 rounded-none bg-transparent py-3 text-lg font-medium tabular-nums text-bone caret-brass outline-none"
              />
            </div>
            <p
              id="account-balance-note"
              className={`mt-2 text-[13px] leading-snug ${errors.openingBalance ? 'text-error' : 'text-mist'}`}
            >
              {errors.openingBalance ?? 'Optional. Leave it blank to start at ₹0.00.'}
            </p>
          </div>
        )}

        {formError && (
          <p role="alert" className="mt-6 text-sm text-error">
            {formError}
          </p>
        )}

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="h-13 flex-1 cursor-pointer rounded-[7px] bg-brass text-base font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add account'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 cursor-pointer px-2 text-[15px] font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}