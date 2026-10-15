import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { api_error } from '../api/helpers.js';
import { ROLE_HOME, useAuth } from '../context/AuthContext.jsx';
import { validateLogin } from '../utils/validators.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validateLogin(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const loggedIn = await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from || ROLE_HOME[loggedIn.role] || '/', { replace: true });
    } catch (err) {
      setServerError(api_error(err, 'Login failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to apply for jobs, manage listings or review applicants.</p>
        <Alert>{serverError}</Alert>
        <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} error={errors.password} />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>
        <p className="center small">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="demo-credentials small">
          Local demo only: seeker@demo.jobportal.local or recruiter@demo.jobportal.local with the demo password from the README.
        </p>
      </form>
    </div>
  );
}
