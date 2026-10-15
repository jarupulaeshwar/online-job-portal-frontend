import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { api_error } from '../api/helpers.js';
import { ROLE_HOME, useAuth } from '../context/AuthContext.jsx';
import { PASSWORD_HINT, validateRegistration } from '../utils/validators.js';

export default function Register() {
  const { user, registerSeeker, registerRecruiter } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'recruiter' ? 'RECRUITER' : 'JOB_SEEKER');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;

  const isRecruiter = role === 'RECRUITER';
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validateRegistration(form, isRecruiter);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const body = { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password };
      const created = isRecruiter
        ? await registerRecruiter({ ...body, companyName: form.companyName.trim() })
        : await registerSeeker(body);
      navigate(ROLE_HOME[created.role], { replace: true });
    } catch (err) {
      setServerError(api_error(err, 'Registration failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <div className="segmented" role="tablist" aria-label="Account type">
          <button type="button" role="tab" aria-selected={!isRecruiter} className={!isRecruiter ? 'active' : ''} onClick={() => setRole('JOB_SEEKER')}>
            I am looking for a job
          </button>
          <button type="button" role="tab" aria-selected={isRecruiter} className={isRecruiter ? 'active' : ''} onClick={() => setRole('RECRUITER')}>
            I am hiring
          </button>
        </div>
        <Alert>{serverError}</Alert>
        <FormField label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={change} error={errors.fullName} />
        <FormField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} error={errors.email} />
        {isRecruiter && (
          <FormField label="Company name" name="companyName" value={form.companyName} onChange={change} error={errors.companyName} />
        )}
        <FormField label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} error={errors.password} hint={PASSWORD_HINT} />
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating account...' : isRecruiter ? 'Create recruiter account' : 'Create job seeker account'}
        </button>
        <p className="center small">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
