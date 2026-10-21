import { useState } from 'react';

// Ruled-line input. Pass type="password" to get a Show / Hide toggle.
export default function TextField({ id, label, type = 'text', error, hint, ...inputProps }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="mt-6">
      <label htmlFor={id} className="block text-sm font-medium text-mist">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          className={`mt-1 block w-full rounded-none border-b bg-transparent py-3 text-lg font-medium text-bone caret-brass focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-brass ${
            error ? 'border-error' : 'border-rule'
          } ${isPassword ? 'pr-16' : ''}`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute right-0 bottom-1 min-h-10 cursor-pointer px-1 text-sm font-semibold text-brass hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error ? (
        <p id={messageId} className="mt-2 text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-2 text-[13px] leading-snug text-mist">
          {hint}
        </p>
      ) : null}
    </div>
  );
}