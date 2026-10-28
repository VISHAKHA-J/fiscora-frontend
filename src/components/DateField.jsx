// Ruled-line date input. Dates are plain "YYYY-MM-DD" strings.
export default function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
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
      <input
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={messageId}
        className={`mt-1 block w-full rounded-none border-b bg-transparent font-medium text-bone [color-scheme:dark] focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brass ${
          compact ? 'py-2.5 text-base' : 'py-3 text-lg'
        } ${error ? 'border-error' : 'border-rule'}`}
      />
      {error && (
        <p id={messageId} className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}