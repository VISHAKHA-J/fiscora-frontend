import { useEffect, useRef, useState } from 'react';
import DateField from './DateField.jsx';
import SelectField from './SelectField.jsx';
import TextField from './TextField.jsx';
import { parseApiError } from '../services/apiError.js';
import { todayISO } from '../utils/date.js';

const TYPES = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
];

// One dialog for add and edit. Pass `transaction` to edit.
// `onSave(payload)` returns a promise; throw to show the error here.
export default function TransactionDialog({ transaction, accounts, categories, onSave, onClose }) {
  const isEdit = Boolean(transaction);
  const today = todayISO();

  const [type, setType] = useState(transaction?.type ?? 'EXPENSE');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [categoryId, setCategoryId] = useState(transaction ? String(transaction.categoryId) : '');
  const [accountId, setAccountId] = useState(
    transaction ? String(transaction.accountId) : accounts.length === 1 ? String(accounts[0].id) : '',
  );
  const [date, setDate] = useState(transaction?.date ?? today);
  const [note, setNote] = useState(transaction?.note ?? '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    amountRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categoryOptions = categories
    .filter((item) => item.type === type)
    .map((item) => ({ value: String(item.id), label: item.name }));
  const accountOptions = accounts.map((item) => ({ value: String(item.id), label: item.name }));

  // Typing in a field clears that field's old error.
  const edit = (setter, field) => (event) => {
    setter(event.target.value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const chooseType = (next) => {
    setType(next);
    // A category belongs to one type, so a stale choice is cleared.
    if (!categories.some((item) => String(item.id) === categoryId && item.type === next)) {
      setCategoryId('');
    }
    setErrors((current) => ({ ...current, categoryId: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    const amountText = amount.trim();
    if (!amountText) next.amount = 'Enter an amount.';
    else if (!/^\d+(\.\d{1,2})?$/.test(amountText)) next.amount = 'Use numbers only, with up to two decimals.';
    else if (Number(amountText) <= 0) next.amount = 'Amount must be greater than zero.';
    if (!categoryId) next.categoryId = 'Choose a category.';
    if (!accountId) next.accountId = 'Choose an account.';
    if (!date) next.date = 'Choose a date.';
    else if (date > today) next.date = 'Date cannot be in the future.';

    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await onSave({
        accountId: Number(accountId),
        categoryId: Number(categoryId),
        amount: Number(amountText),
        date,
        note: note.trim(),
      });
    } catch (error) {
      const parsed = parseApiError(error);
      if (Object.keys(parsed.fieldErrors).length) setErrors(parsed.fieldErrors);
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
        aria-labelledby="transaction-dialog-title"
        onSubmit={handleSubmit}
        noValidate
        className="max-h-full w-full max-w-110 overflow-y-auto rounded border border-[#243c3f] bg-pane p-9"
      >
        <h2 id="transaction-dialog-title" className="font-display text-[32px] leading-[1.15]">
          {isEdit ? 'Edit transaction' : 'Add a transaction'}
        </h2>

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
                  onClick={() => chooseType(option.value)}
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

        <div className="mt-6">
          <label htmlFor="transaction-amount" className="block text-sm font-medium text-mist">
            Amount
          </label>
          <div
            className={`mt-1 flex items-baseline gap-2 border-b ${
              errors.amount ? 'border-error' : 'border-rule'
            } focus-within:border-brass`}
          >
            <span className="text-lg font-medium text-mist">₹</span>
            <input
              id="transaction-amount"
              ref={amountRef}
              inputMode="decimal"
              value={amount}
              onChange={edit(setAmount, 'amount')}
              aria-invalid={errors.amount ? 'true' : undefined}
              aria-describedby={errors.amount ? 'transaction-amount-error' : undefined}
              className="block min-w-0 flex-1 rounded-none bg-transparent py-3 text-lg font-medium tabular-nums text-bone caret-brass outline-none"
            />
          </div>
          {errors.amount && (
            <p id="transaction-amount-error" className="mt-2 text-sm text-error">
              {errors.amount}
            </p>
          )}
        </div>

        <SelectField
          id="transaction-category"
          label="Category"
          value={categoryId}
          onChange={edit(setCategoryId, 'categoryId')}
          options={categoryOptions}
          placeholder={categoryOptions.length ? 'Choose a category' : `No ${type.toLowerCase()} categories`}
          error={errors.categoryId}
        />

        <SelectField
          id="transaction-account"
          label="Account"
          value={accountId}
          onChange={edit(setAccountId, 'accountId')}
          options={accountOptions}
          placeholder="Choose an account"
          error={errors.accountId}
        />

        <DateField
          id="transaction-date"
          label="Date"
          value={date}
          max={today}
          onChange={edit(setDate, 'date')}
          error={errors.date}
        />

        <TextField
          id="transaction-note"
          label="Note (optional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          error={errors.note}
          maxLength={255}
          autoComplete="off"
        />

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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add transaction'}
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