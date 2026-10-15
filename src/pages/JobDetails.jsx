import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { publicApi, seekerApi } from '../api/index.js';
import { api_error } from '../api/helpers.js';
import Alert from '../components/Alert.jsx';
import CompanyLogo from '../components/CompanyLogo.jsx';
import FormField from '../components/FormField.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { experienceLabel, formatDate, formatSalary, jobTypeLabel, workModeLabel } from '../utils/format.js';

const REPORT_REASONS = ['Looks like a scam', 'Misleading information', 'Discriminatory content', 'Duplicate listing', 'Other'];

const lines = (text) => (text || '').split('\n').map((l) => l.trim()).filter(Boolean);

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [cover, setCover] = useState('');
  const [applyError, setApplyError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ reason: REPORT_REASONS[0], details: '' });

  const isSeeker = user?.role === 'JOB_SEEKER';

  const load = useCallback(() => {
    setLoading(true);
    publicApi
      .getJob(id)
      .then((j) => { setJob(j); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load this job.')))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load, user?.id]);
  useEffect(() => {
    if (isSeeker) seekerApi.profile().then(setProfile).catch(() => setProfile(null));
  }, [isSeeker]);

  if (loading) return <Spinner label="Loading job..." />;
  if (error || !job) {
    return (
      <div className="container page-narrow center">
        <Alert>{error || 'Job not found.'}</Alert>
        <Link to="/jobs" className="btn btn-primary">Back to all jobs</Link>
      </div>
    );
  }

  const toggleSave = async () => {
    try {
      if (job.saved) await seekerApi.unsaveJob(job.id);
      else await seekerApi.saveJob(job.id);
      toast.success(job.saved ? 'Removed from saved jobs.' : 'Job saved.');
      load();
    } catch (err) {
      toast.error(api_error(err, 'Could not update saved jobs.'));
    }
  };

  const submitApplication = async () => {
    setBusy(true);
    setApplyError('');
    try {
      await seekerApi.apply({ jobId: job.id, coverLetter: cover.trim() || null });
      setApplyOpen(false);
      setCover('');
      toast.success('Application submitted. You can track it under My Applications.');
      load();
    } catch (err) {
      setApplyError(api_error(err, 'Could not submit your application.'));
    } finally {
      setBusy(false);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await seekerApi.reportJob(job.id, { reason: report.reason, details: report.details.trim() || null });
      setReportOpen(false);
      toast.success('Thank you. Our team will review this listing.');
    } catch (err) {
      toast.error(api_error(err, 'Could not send your report.'));
    } finally {
      setBusy(false);
    }
  };

  const incomplete = profile && !profile.complete;

  return (
    <div className="container section">
      <Link to="/jobs" className="back-link">&larr; All jobs</Link>
      <div className="detail-layout">
        <article className="card detail-main">
          <header className="detail-head">
            <CompanyLogo name={job.company.name} size={64} />
            <div>
              <h1>{job.title}</h1>
              <p className="job-card-company">
                {job.company.name}
                {job.demo && <span className="badge badge-demo">Demo listing</span>}
                <span className={`badge ${job.open ? 'badge-open' : 'badge-closed'}`}>{job.open ? 'Active' : 'Closed'}</span>
              </p>
            </div>
          </header>

          {!job.open && <Alert type="info">This job is closed and is no longer accepting applications.</Alert>}
          {job.demo && <Alert type="info">This is a demonstration listing created for testing. It is not a real vacancy.</Alert>}

          <ul className="meta-list meta-wide">
            <li><Icon name="pin" size={16} /> {job.location}</li>
            <li><Icon name="rupee" size={16} /> {formatSalary(job.salaryMin, job.salaryMax)}</li>
            <li><Icon name="briefcase" size={16} /> {jobTypeLabel(job.jobType)} &middot; {workModeLabel(job.workMode)}</li>
            <li><Icon name="clock" size={16} /> {experienceLabel(job.experienceLevel)}</li>
            <li><Icon name="clock" size={16} /> Apply by {formatDate(job.deadline)}</li>
          </ul>

          <h2>About the role</h2>
          <p className="prewrap">{job.description}</p>

          {lines(job.responsibilities).length > 0 && (
            <>
              <h2>Responsibilities</h2>
              <ul className="bullets">{lines(job.responsibilities).map((l) => <li key={l}>{l}</li>)}</ul>
            </>
          )}

          <h2>Required skills</h2>
          <div className="chips">{job.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>

          {lines(job.qualifications).length > 0 && (
            <>
              <h2>Qualifications</h2>
              <ul className="bullets">{lines(job.qualifications).map((l) => <li key={l}>{l}</li>)}</ul>
            </>
          )}
        </article>

        <aside className="detail-side">
          <div className="card">
            <h2>Apply for this job</h2>
            {!user && (
              <>
                <p className="muted">Log in as a job seeker to apply.</p>
                <button type="button" className="btn btn-primary btn-block"
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}>
                  Log in to apply
                </button>
              </>
            )}
            {user && !isSeeker && <p className="muted">Only job seeker accounts can apply for jobs.</p>}
            {isSeeker && (
              <>
                {job.applied ? (
                  <p className="success-text">You have applied for this job. <Link to="/seeker/applications">View status</Link></p>
                ) : !job.open ? (
                  <p className="muted">Applications are closed.</p>
                ) : incomplete ? (
                  <>
                    <Alert type="info">Complete your profile and upload a resume first (missing: {profile.missingFields.join(', ')}).</Alert>
                    <Link to="/seeker/profile" className="btn btn-primary btn-block">Complete my profile</Link>
                  </>
                ) : (
                  <button type="button" className="btn btn-primary btn-block" onClick={() => { setApplyError(''); setApplyOpen(true); }}>
                    Apply now
                  </button>
                )}
                <button type="button" className={`btn btn-ghost btn-block ${job.saved ? 'is-saved' : ''}`} onClick={toggleSave}>
                  <Icon name="heart" size={16} /> {job.saved ? 'Saved - click to remove' : 'Save job'}
                </button>
                <button type="button" className="link-button" onClick={() => setReportOpen(true)}>Report this listing</button>
              </>
            )}
          </div>
          <div className="card">
            <h2>About {job.company.name}</h2>
            <p className="muted small">{job.company.industry} {job.company.companySize ? `\u00B7 ${job.company.companySize}` : ''}</p>
            <p>{job.company.description || 'No company description yet.'}</p>
            <Link to={`/jobs?companyId=${job.company.id}`}>More jobs at this company</Link>
          </div>
        </aside>
      </div>

      <Modal open={applyOpen} title={`Apply to ${job.title}`} onClose={() => !busy && setApplyOpen(false)}>
        <Alert>{applyError}</Alert>
        <p className="muted">Your saved resume ({profile?.resumeOriginalName}) will be sent with this application.</p>
        <FormField as="textarea" rows={6} label="Cover letter (optional)" value={cover} maxLength={3000}
          onChange={(e) => setCover(e.target.value)} hint={`${cover.length}/3000`} />
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setApplyOpen(false)} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={submitApplication} disabled={busy}>
            {busy ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      </Modal>

      <Modal open={reportOpen} title="Report this listing" onClose={() => setReportOpen(false)}>
        <form onSubmit={submitReport}>
          <FormField as="select" label="Reason" value={report.reason} onChange={(e) => setReport({ ...report, reason: e.target.value })}>
            {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </FormField>
          <FormField as="textarea" rows={4} label="Details (optional)" value={report.details} maxLength={2000}
            onChange={(e) => setReport({ ...report, details: e.target.value })} />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setReportOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={busy}>Send report</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
