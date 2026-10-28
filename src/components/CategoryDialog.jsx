import { useEffect, useRef, useState } from 'react';
import TextField from './TextField.jsx';
import { parseApiError } from '../services/apiError.js';

const TYPES = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
];

// One dialog for add and edit. Pass `category` to edit: only the name can change then.
// `onSave(payload)` returns a promise; throw to show the error here.
export default function CategoryDialog({ category, onSave, onClose }) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState(category?.type ?? 'EXPENSE');
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
    const trimmed = name.trim();
    setFormError('');
    if (!trimmed) {
      setErrors({ name: 'Enter a name for this category.' });
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await onSave(isEdit ? { name: trimmed } : { name: trimmed, type });
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
        aria-labelledby="category-dialog-title"
        onSubmit={handleSubmit}
        noValidate
        className="max-h-full w-full max-w-110 overflow-y-auto rounded border border-[#243c3f] bg-pane p-9"
      >
        <h2 id="category-dialog-title" className="font-display text-[32px] leading-[1.15]">
          {isEdit ? 'Edit category' : 'Add a category'}
        </h2>
        <p className="mt-1.5 text-[15px] leading-normal text-mist">
          A label for where money comes from or goes.
        </p>

        <TextField
          id="category-name"
          label="Name"
          ref={nameRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          maxLength={50}
          autoComplete="off"
        />

        <fieldset className="mt-6 min-w-0 border-0 p-0">
          <legend className="p-0 text-sm font-medium text-mist">Type</legend>
          {isEdit ? (
            <p className="mt-1.5 text-base font-medium text-bone">
              {type === 'INCOME' ? 'Income' : 'Expense'}
              <span className="mt-1 block text-[13px] font-normal text-mist">
                The type can't be changed after a category is created.
              </span>
            </p>
          ) : (
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
          )}
        </fieldset>

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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add category'}
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