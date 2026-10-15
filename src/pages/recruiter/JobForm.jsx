import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recruiterApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import FormField from '../../components/FormField.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '../../utils/format.js';
import { RECRUITER_NAV } from './nav.js';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  title: '', description: '', responsibilities: '', requiredSkills: '', qualifications: '', location: '',
  salaryMin: '', salaryMax: '', jobType: 'FULL_TIME', experienceLevel: 'FRESHER', workMode: 'ONSITE', deadline: '',
};

export default function JobForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('DRAFT');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    recruiterApi.job(id)
      .then((j) => {
        setStatus(j.status);
        setForm({
          title: j.title, description: j.description, responsibilities: j.responsibilities || '',
          requiredSkills: j.requiredSkills, qualifications: j.qualifications || '', location: j.location,
          salaryMin: j.salaryMin ?? '', salaryMax: j.salaryMax ?? '', jobType: j.jobType,
          experienceLevel: j.experienceLevel, workMode: j.workMode, deadline: j.deadline,
        });
      })
      .catch((err) => setError(api_error(err, 'Could not load this job.')))
      .finally(() => setLoading(false));
  }, [editing, id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const found = {};
    if (!form.title.trim()) found.title = 'Enter a job title.';
    if (!form.description.trim()) found.description = 'Describe the role.';
    if (!form.requiredSkills.trim()) found.requiredSkills = 'List at least one skill, separated by commas.';
    if (!form.location.trim()) found.location = 'Enter a location.';
    if (!form.deadline) found.deadline = 'Choose an application deadline.';
    else if (form.deadline < today() && (!editing || status === 'PUBLISHED')) found.deadline = 'The deadline cannot be in the past.';
    const min = form.salaryMin === '' ? null : Number(form.salaryMin);
    const max = form.salaryMax === '' ? null : Number(form.salaryMax);
    if (min !== null && (Number.isNaN(min) || min < 0)) found.salaryMin = 'Enter a valid amount.';
    if (max !== null && (Number.isNaN(max) || max < 0)) found.salaryMax = 'Enter a valid amount.';
    if (min !== null && max !== null && min > max) found.salaryMax = 'Maximum must be at least the minimum.';
    return found;
  };

  const payload = () => ({
    ...form,
    salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
    salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
    responsibilities: form.responsibilities.trim() || null,
    qualifications: form.qualifications.trim() || null,
  });

  const save = async (publish) => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setError('');
    try {
      let jobId = id;
      if (editing) await recruiterApi.updateJob(id, payload());
      else jobId = (await recruiterApi.createJob(payload())).id;
      if (publish && status !== 'PUBLISHED') await recruiterApi.publishJob(jobId);
      toast.success(publish ? 'Job published.' : 'Job saved.');
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(api_error(err, 'Could not save this job.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container section">
      <h1>{editing ? 'Edit job' : 'Post a new job'}</h1>
      <DashboardNav items={RECRUITER_NAV} />
      <Alert>{error}</Alert>
      <form className="card form-grid" noValidate onSubmit={(e) => { e.preventDefault(); save(false); }}>
        <div className="span-2"><FormField label="Job title" name="title" value={form.title} onChange={change} error={errors.title} maxLength={150} /></div>
        <div className="span-2"><FormField as="textarea" rows={5} label="Description" name="description" value={form.description} onChange={change} error={errors.description} /></div>
        <div className="span-2"><FormField as="textarea" rows={4} label="Responsibilities (one per line)" name="responsibilities" value={form.responsibilities} onChange={change} /></div>
        <div className="span-2"><FormField as="textarea" rows={2} label="Required skills (comma separated)" name="requiredSkills" value={form.requiredSkills} onChange={change} error={errors.requiredSkills} placeholder="Java, Spring Boot, MySQL" /></div>
        <div className="span-2"><FormField as="textarea" rows={3} label="Qualifications (one per line)" name="qualifications" value={form.qualifications} onChange={change} /></div>
        <FormField label="Location" name="location" value={form.location} onChange={change} error={errors.location} placeholder="Hyderabad, Telangana" />
        <FormField label="Application deadline" name="deadline" type="date" value={form.deadline} onChange={change} error={errors.deadline} />
        <FormField label="Minimum salary (INR per year)" name="salaryMin" type="number" min="0" value={form.salaryMin} onChange={change} error={errors.salaryMin} />
        <FormField label="Maximum salary (INR per year)" name="salaryMax" type="number" min="0" value={form.salaryMax} onChange={change} error={errors.salaryMax} />
        <FormField as="select" label="Employment type" name="jobType" value={form.jobType} onChange={change}>
          {JOB_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormField>
        <FormField as="select" label="Experience level" name="experienceLevel" value={form.experienceLevel} onChange={change}>
          {EXPERIENCE_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormField>
        <FormField as="select" label="Work mode" name="workMode" value={form.workMode} onChange={change}>
          {WORK_MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FormField>
        <div className="span-2 btn-row">
          <button type="submit" className="btn btn-ghost" disabled={busy}>{editing ? 'Save changes' : 'Save as draft'}</button>
          {status !== 'PUBLISHED' && (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save(true)}>
              {editing ? 'Save and publish' : 'Publish job'}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/recruiter/jobs')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
