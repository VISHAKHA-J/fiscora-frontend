import { useCallback, useEffect, useState } from 'react';
import CategoryDialog from '../components/CategoryDialog.jsx';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService.js';
import { parseApiError } from '../services/apiError.js';

const SECTIONS = [
  { type: 'INCOME', title: 'Income', empty: 'No income categories yet.' },
  { type: 'EXPENSE', title: 'Expenses', empty: 'No expense categories yet.' },
];

const addButton =
  'cursor-pointer rounded-[7px] bg-brass px-6 font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bone';
const textAction =
  'min-h-10 cursor-pointer px-1.5 text-sm font-medium text-mist hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [dialog, setDialog] = useState(null); // null | { category? }
  const [confirmingId, setConfirmingId] = useState(null);
  const [rowError, setRowError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setCategories(await getCategories());
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

  const byName = (a, b) => a.name.localeCompare(b.name);

  const handleSave = async (payload) => {
    if (dialog.category) {
      const updated = await updateCategory(dialog.category.id, payload);
      setCategories((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const created = await createCategory(payload);
      setCategories((list) => [...list, created]);
    }
    setDialog(null);
  };

  const handleDelete = async (id) => {
    setRowError('');
    try {
      await deleteCategory(id);
      setCategories((list) => list.filter((item) => item.id !== id));
      setConfirmingId(null);
    } catch (error) {
      const parsed = parseApiError(error);
      if (parsed.status === 404) {
        setCategories((list) => list.filter((item) => item.id !== id));
        setConfirmingId(null);
      } else {
        setRowError(parsed.message);
      }
    }
  };

  const isEmpty = status === 'ready' && categories.length === 0;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <h1 className="font-display text-[44px] leading-[1.1] font-normal tracking-[-0.005em]">
          Categories
        </h1>
        {status === 'ready' && !isEmpty && (
          <button type="button" onClick={() => setDialog({})} className={`h-12 text-base ${addButton}`}>
            Add category
          </button>
        )}
      </div>

      {status === 'loading' && (
        <p role="status" className="mt-11 text-mist">
          Loading your categories…
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
          <h2 className="font-display text-[32px] leading-[1.15] font-normal">No categories yet.</h2>
          <p className="mt-3 max-w-[44ch] text-base leading-[1.6] text-mist">
            Categories sort your money into groups, such as Salary on the income side or Food and
            Rent on the expense side. Add a few to get started.
          </p>
          <button
            type="button"
            onClick={() => setDialog({})}
            className={`mt-7 block h-13 px-7 text-base ${addButton}`}
          >
            Add your first category
          </button>
        </div>
      )}

      {status === 'ready' && !isEmpty && (
        <>
          {rowError && (
            <p role="alert" className="mt-8 text-sm text-error">
              {rowError}
            </p>
          )}

          {SECTIONS.map((section) => {
            const items = categories.filter((item) => item.type === section.type).sort(byName);
            return (
              <section key={section.type} className="mt-11" aria-labelledby={`${section.type}-title`}>
                <h2 id={`${section.type}-title`} className="text-sm font-medium text-mist">
                  {section.title}
                </h2>

                {items.length === 0 ? (
                  <p className="mt-3 border-t border-[#1e3538] pt-4 text-[15px] text-mist">
                    {section.empty}
                  </p>
                ) : (
                  <ul className="mt-3 border-t border-[#1e3538]">
                    {items.map((category) => {
                      const confirming = confirmingId === category.id;
                      return (
                        <li
                          key={category.id}
                          className="flex flex-wrap items-center justify-between gap-x-8 border-b border-[#1e3538] py-3.5"
                        >
                          <div className="min-w-0 truncate text-lg font-medium">{category.name}</div>

                          <div className="flex items-center gap-2">
                            {confirming ? (
                              <>
                                <span className="text-sm text-mist">Delete {category.name}?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(category.id)}
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
                                  aria-label={`Edit ${category.name}`}
                                  onClick={() => setDialog({ category })}
                                  className={textAction}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Delete ${category.name}`}
                                  onClick={() => {
                                    setRowError('');
                                    setConfirmingId(category.id);
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
              </section>
            );
          })}
        </>
      )}

      {dialog && (
        <CategoryDialog category={dialog.category} onSave={handleSave} onClose={closeDialog} />
      )}
    </>
  );
}