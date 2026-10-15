import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seekerApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import FormField from '../../components/FormField.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { isPhone } from '../../utils/validators.js';
import { SEEKER_NAV } from './nav.js';

const EMPTY = { fullName: '', phone: '', location: '', summary: '', skills: '', education: '', experience: '' };

export default function MyProfile() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [profile, setProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    seekerApi.profile()
      .then((p) => {
        setProfile(p);
        setForm({
          fullName: p.fullName || '', phone: p.phone || '', location: p.location || '', summary: p.summary || '',
          skills: p.skills || '', education: p.education || '', experience: p.experience || '',
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
    if (!isPhone(form.phone)) found.phone = 'Enter a valid phone number.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError('');
    try {
      const saved = await seekerApi.updateProfile(form);
      setProfile(saved);
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
      <h1>My profile</h1>
      <DashboardNav items={SEEKER_NAV} />
      <Alert>{error}</Alert>
      {profile && !profile.complete && (
        <Alert type="info">To apply for jobs, please fill in: {profile.missingFields.join(', ')}.</Alert>
      )}
      <form className="card form-grid" onSubmit={submit} noValidate>
        <FormField label="Full name" name="fullName" value={form.fullName} onChange={change} error={errors.fullName} />
        <FormField label="Email" value={profile?.email || ''} disabled readOnly hint="Your email cannot be changed." />
        <FormField label="Phone" name="phone" value={form.phone} onChange={change} error={errors.phone} />
        <FormField label="Location" name="location" value={form.location} onChange={change} placeholder="City, State" />
        <div className="span-2">
          <FormField as="textarea" rows={4} label="Professional summary" name="summary" value={form.summary} onChange={change} maxLength={3000} />
        </div>
        <div className="span-2">
          <FormField as="textarea" rows={2} label="Skills (comma separated)" name="skills" value={form.skills} onChange={change} maxLength={2000} placeholder="Java, SQL, React" />
        </div>
        <div className="span-2">
          <FormField as="textarea" rows={3} label="Education" name="education" value={form.education} onChange={change} maxLength={3000} />
        </div>
        <div className="span-2">
          <FormField as="textarea" rows={4} label="Experience" name="experience" value={form.experience} onChange={change} maxLength={3000} />
        </div>
        <div className="span-2 btn-row">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}</button>
          <Link to="/seeker/resume" className="btn btn-ghost">
            {profile?.hasResume ? 'Manage resume' : 'Upload resume'}
          </Link>
        </div>
      </form>
    </div>
  );
}
