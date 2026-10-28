import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { parseApiError } from '../services/apiError.js';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const found = {};
    if (!form.username.trim()) found.username = 'Username is required';
    if (!form.password) found.password = 'Password is required';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await login({ username: form.username.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <form onSubmit={handleSubmit} noValidate>
        <h1 className="mb-3.5 font-display text-[length:clamp(2rem,4vw,2.75rem)] leading-[1.1] font-normal tracking-[-0.005em]">
          Your ledger, as you left it.
        </h1>
        <p className="mb-3 max-w-[36ch] text-base leading-relaxed text-mist">
          Log in to see your balances and this month’s budgets.
        </p>

        <TextField
          id="login-username"
          name="username"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
        <TextField
          id="login-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        {formError && (
          <p role="alert" className="mt-6 text-sm text-error">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-9 block h-[52px] w-full cursor-pointer rounded-[3px] bg-brass text-base font-semibold text-ink hover:bg-brass-light focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-bone disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-6 text-[15px] leading-normal text-mist">
          New to Fiscora?{' '}
          <Link
            to="/register"
            className="text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}