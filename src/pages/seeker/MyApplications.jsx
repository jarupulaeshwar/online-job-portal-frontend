import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seekerApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ResumeButtons from '../../components/ResumeButtons.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, formatSalary } from '../../utils/format.js';
import { SEEKER_NAV } from './nav.js';

export default function MyApplications() {
  const toast = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    seekerApi.myApplications()
      .then((a) => { setApps(a); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load your applications.')))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const confirmWithdraw = async () => {
    setBusy(true);
    try {
      await seekerApi.withdraw(withdrawing.id);
      toast.success('Application withdrawn.');
      setWithdrawing(null);
      load();
    } catch (err) {
      toast.error(api_error(err, 'Could not withdraw this application.'));
      setWithdrawing(null);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container section">
      <h1>My applications</h1>
      <DashboardNav items={SEEKER_NAV} />
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : apps.length === 0 ? (
        <EmptyState title="No applications yet" message="When you apply for a job it will appear here with its status."
          action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
      ) : (
        <div className="stack">
          {apps.map((a) => (
            <article key={a.id} className="card application-card">
              <div className="application-head">
                <div>
                  <h3><Link to={`/jobs/${a.job.id}`}>{a.job.title}</Link></h3>
                  <p className="muted">{a.job.company.name} &middot; {a.job.location} &middot; {formatSalary(a.job.salaryMin, a.job.salaryMax)}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="small muted">
                Applied {formatDate(a.appliedAt)}
                {a.updatedAt !== a.appliedAt && ` \u00B7 Updated ${formatDate(a.updatedAt)}`}
                {!a.job.open && ' \u00B7 Job closed'}
              </p>
              {a.coverLetter && <details><summary>Your cover letter</summary><p className="prewrap">{a.coverLetter}</p></details>}
              <div className="btn-row">
                {a.resumeOriginalName && (
                  <ResumeButtons fetchBlob={() => seekerApi.applicationResumeBlob(a.id)} filename={a.resumeOriginalName} />
                )}
                {a.canWithdraw && (
                  <button type="button" className="btn btn-danger-ghost" onClick={() => setWithdrawing(a)}>Withdraw</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(withdrawing)} danger busy={busy} title="Withdraw application?"
        message={withdrawing ? `You will withdraw your application for ${withdrawing.job.title}. You will not be able to apply again for this job.` : ''}
        confirmLabel="Withdraw" onConfirm={confirmWithdraw} onCancel={() => setWithdrawing(null)} />
    </div>
  );
}
