import { useEffect, useState } from 'react';
import { recruiterApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import FormField from '../../components/FormField.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { RECRUITER_NAV } from './nav.js';

const EMPTY = {
  fullName: '', phone: '', designation: '', companyName: '', companyDescription: '',
  industry: '', website: '', companyLocation: '', companySize: '',
};

export default function CompanyProfile() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    recruiterApi.profile()
      .then((p) => {
        setEmail(p.email);
        setForm({
          fullName: p.fullName || '', phone: p.phone || '', designation: p.designation || '',
          companyName: p.companyName || '', companyDescription: p.companyDescription || '', industry: p.industry || '',
          website: p.website || '', companyLocation: p.companyLocation || '', companySize: p.companySize || '',
        });
      })
      .catch((err) => setError(api_error(err, 'Could not load your profile.')))
      .finally(() => setLoading(false));
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.fullName.trim()) found.fullName = 'Enter your full name.';
    if (!form.companyName.trim()) found.companyName = 'Enter your company name.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError('');
    try {
      await recruiterApi.updateProfile(form);
      toast.success('Profile saved.');
    } catch (err) {
      setError(api_error(err, 'Could not save your profile.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container section">
      <h1>Company profile</h1>
      <DashboardNav items={RECRUITER_NAV} />
      <Alert>{error}</Alert>
      <form className="card form-grid" onSubmit={submit} noValidate>
        <h2 className="span-2">Your details</h2>
        <FormField label="Full name" name="fullName" value={form.fullName} onChange={change} error={errors.fullName} />
        <FormField label="Email" value={email} disabled readOnly />
        <FormField label="Phone" name="phone" value={form.phone} onChange={change} />
        <FormField label="Designation" name="designation" value={form.designation} onChange={change} placeholder="HR Manager" />
        <h2 className="span-2">Company</h2>
        <FormField label="Company name" name="companyName" value={form.companyName} onChange={change} error={errors.companyName} />
        <FormField label="Industry" name="industry" value={form.industry} onChange={change} />
        <FormField label="Website" name="website" value={form.website} onChange={change} placeholder="https://" />
        <FormField label="Company location" name="companyLocation" value={form.companyLocation} onChange={change} />
        <FormField label="Company size" name="companySize" value={form.companySize} onChange={change} placeholder="51-200 employees" />
        <div className="span-2">
          <FormField as="textarea" rows={4} label="About the company" name="companyDescription" value={form.companyDescription} onChange={change} maxLength={3000} />
        </div>
        <div className="span-2 btn-row">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
        </div>
      </form>
    </div>
  );
}
