import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import { RECRUITER_NAV } from './nav.js';

export default function ManageJobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'delete' | 'close', job }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    recruiterApi.jobs()
      .then((j) => { setJobs(j); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load your jobs.')))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      load();
    } catch (err) {
      toast.error(api_error(err, 'That action could not be completed.'));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const publish = (job) => run(() => recruiterApi.publishJob(job.id), 'Job published.');
  const confirmed = () => {
    if (confirm.type === 'delete') return run(() => recruiterApi.deleteJob(confirm.job.id), 'Job deleted.');
    return run(() => recruiterApi.closeJob(confirm.job.id), 'Job closed.');
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h1>Manage jobs</h1>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">Post a new job</Link>
      </div>
      <DashboardNav items={RECRUITER_NAV} />
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState title="You have not posted any jobs" message="Create your first job listing to start receiving applications."
          action={<Link to="/recruiter/jobs/new" className="btn btn-primary">Post a job</Link>} />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Location</th><th>Deadline</th><th>Status</th><th>Applicants</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    {job.status === 'PUBLISHED' || job.status === 'CLOSED'
                      ? <Link to={`/jobs/${job.id}`}>{job.title}</Link> : job.title}
                    {job.demo && <span className="badge badge-demo">Demo</span>}
                  </td>
                  <td>{job.location}</td>
                  <td>{formatDate(job.deadline)}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td>
                    <Link to={`/recruiter/applicants?jobId=${job.id}`}>{job.applicationCount}</Link>
                  </td>
                  <td>
                    <div className="btn-row">
                      {job.status !== 'REMOVED' && <Link className="btn btn-ghost btn-sm" to={`/recruiter/jobs/${job.id}/edit`}>Edit</Link>}
                      {(job.status === 'DRAFT' || job.status === 'CLOSED') && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => publish(job)}>
                          {job.status === 'CLOSED' ? 'Reopen' : 'Publish'}
                        </button>
                      )}
                      {job.status === 'PUBLISHED' && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm({ type: 'close', job })}>Close</button>
                      )}
                      {job.applicationCount === 0 && (
                        <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setConfirm({ type: 'delete', job })}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={Boolean(confirm)} danger={confirm?.type === 'delete'} busy={busy}
        title={confirm?.type === 'delete' ? 'Delete this job?' : 'Close this job?'}
        message={confirm ? (confirm.type === 'delete'
          ? `"${confirm.job.title}" will be permanently deleted. This cannot be undone.`
          : `"${confirm.job.title}" will stop accepting applications. You can reopen it later.`) : ''}
        confirmLabel={confirm?.type === 'delete' ? 'Delete' : 'Close job'}
        onConfirm={confirmed} onCancel={() => setConfirm(null)} />
    </div>
  );
}
