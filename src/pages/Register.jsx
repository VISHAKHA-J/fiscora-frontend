import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { parseApiError } from '../services/apiError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/accounts" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setFormError('');
  };

  // Mirrors the backend rules in RegisterRequest.
  const validate = () => {
    const found = {};
    const username = form.username.trim();

    if (!username) found.username = 'Username is required';
    else if (username.length < 3 || username.length > 50) {
      found.username = 'Username must be 3 to 50 characters';
    }

    if (!form.email.trim()) found.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(form.email.trim())) found.email = 'Email must be valid';

    if (!form.password) found.password = 'Password is required';
    else if (form.password.length < 6 || form.password.length > 72) {
      found.password = 'Password must be 6 to 72 characters';
    }

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
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/accounts', { replace: true });
    } catch (error) {
      const { status, message, fieldErrors } = parseApiError(error);
      if (status === 409) {
        // "Username is already taken" or "Email is already registered"
        const field = message.toLowerCase().includes('email') ? 'email' : 'username';
        setErrors({ [field]: message });
      } else if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setFormError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="register">
      <form onSubmit={handleSubmit} noValidate>
        <h1 className="mb-3.5 font-display text-[length:clamp(2rem,4vw,2.75rem)] leading-[1.1] font-normal tracking-[-0.005em]">
          Start with a clean ledger.
        </h1>
        <p className="mb-3 max-w-[36ch] text-base leading-relaxed text-mist">
          Create an account to track spending, budgets and balances in one place.
        </p>

        <TextField
          id="reg-username"
          name="username"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
        <TextField
          id="reg-email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          id="reg-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          hint="At least 6 characters."
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
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-6 text-[15px] leading-normal text-mist">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brass underline underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}