import { useEffect, useRef, useState } from 'react';
import SelectField from './SelectField.jsx';
import { parseApiError } from '../services/apiError.js';

// One dialog for add and edit. Pass `budget` to edit (only the limit can change).
// `categories` are the expense categories that do not have a budget yet.
export default function BudgetDialog({ budget, categories, onSave, onClose }) {
  const isEdit = Boolean(budget);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState(isEdit ? String(budget.amount) : '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  useEffect(() => {
    (isEdit ? amountRef.current : document.getElementById('budget-category'))?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isEdit, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    const text = amount.trim();
    if (!isEdit && !categoryId) next.categoryId = 'Choose a category.';
    if (!text) next.amount = 'Enter a monthly limit.';
    else if (!/^\d+(\.\d{1,2})?$/.test(text)) next.amount = 'Use numbers only, with up to two decimals.';
    else if (Number(text) <= 0) next.amount = 'The limit must be greater than zero.';

    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await onSave(isEdit ? { amount: Number(text) } : { categoryId: Number(categoryId), amount: Number(text) });
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
        aria-labelledby="budget-dialog-title"
        onSubmit={handleSubmit}
        noValidate
        className="max-h-full w-full max-w-110 overflow-y-auto rounded border border-[#243c3f] bg-pane p-9"
      >
        <h2 id="budget-dialog-title" className="font-display text-[32px] leading-[1.15]">
          {isEdit ? 'Edit budget' : 'Add a budget'}
        </h2>
        <p className="mt-1.5 text-[15px] leading-normal text-mist">
          A spending limit that applies to every month.
        </p>

        {isEdit ? (
          <div className="mt-6">
            <div className="text-sm font-medium text-mist">Category</div>
            <div className="mt-1 border-b border-rule py-3 text-lg font-medium">{budget.categoryName}</div>
          </div>
        ) : (
          <SelectField
            id="budget-category"
            label="Category"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setErrors((current) => ({ ...current, categoryId: undefined }));
            }}
            options={categories.map((item) => ({ value: String(item.id), label: item.name }))}
            placeholder="Choose a category"
            error={errors.categoryId}
          />
        )}

        <div className="mt-6">
          <label htmlFor="budget-amount" className="block text-sm font-medium text-mist">
            Monthly limit
          </label>
          <div
            className={`mt-1 flex items-baseline gap-2 border-b ${
              errors.amount ? 'border-error' : 'border-rule'
            } focus-within:border-brass`}
          >
            <span className="text-lg font-medium text-mist">₹</span>
            <input
              id="budget-amount"
              ref={amountRef}
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setErrors((current) => ({ ...current, amount: undefined }));
              }}
              aria-invalid={errors.amount ? 'true' : undefined}
              aria-describedby={errors.amount ? 'budget-amount-error' : undefined}
              className="block min-w-0 flex-1 rounded-none bg-transparent py-3 text-lg font-medium tabular-nums text-bone caret-brass outline-none"
            />
          </div>
          {errors.amount && (
            <p id="budget-amount-error" className="mt-2 text-sm text-error">
              {errors.amount}
            </p>
          )}
        </div>

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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add budget'}
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