// Ruled-line dropdown. `options` is [{ value, label }]; `placeholder` adds an empty first choice.
export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  compact = false,
  className = 'mt-6',
}) {
  const messageId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-mist">
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          className={`mt-1 block w-full cursor-pointer appearance-none rounded-none border-b bg-transparent pr-7 font-medium focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brass ${
            compact ? 'py-2.5 text-base' : 'py-3 text-lg'
          } ${error ? 'border-error' : 'border-rule'} ${value === '' ? 'text-mist' : 'text-bone'}`}
        >
          {placeholder && (
            <option value="" className="bg-pane text-mist">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-pane text-bone">
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-0.5 bottom-4 size-3 text-mist"
        >
          <path d="M2 4.25 6 8l4-3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {error && (
        <p id={messageId} className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}