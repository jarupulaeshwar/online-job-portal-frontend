import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recruiterApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { APPLICATION_STATUSES, formatDate, statusLabel } from '../../utils/format.js';
import { RECRUITER_NAV } from './nav.js';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([recruiterApi.stats(), recruiterApi.applications({ size: 5 })])
      .then(([s, a]) => { setStats(s); setRecent(a.content); })
      .catch((err) => setError(api_error(err, 'Could not load your dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section">
      <h1>Hello, {user.fullName}</h1>
      <DashboardNav items={RECRUITER_NAV} />
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : stats && (
        <>
          <div className="stat-grid">
            <div className="stat"><span className="stat-value">{stats.jobsPublished}</span><span>Published jobs</span></div>
            <div className="stat"><span className="stat-value">{stats.jobsDraft}</span><span>Drafts</span></div>
            <div className="stat"><span className="stat-value">{stats.jobsClosed}</span><span>Closed jobs</span></div>
            <div className="stat"><span className="stat-value">{stats.applicationsTotal}</span><span>Applications</span></div>
          </div>
          <div className="card">
            <h2>Applications by status</h2>
            <div className="status-row">
              {APPLICATION_STATUSES.map((s) => (
                <span key={s} className="status-count">
                  <StatusBadge status={s} /> <strong>{stats.applicationsByStatus[s]}</strong>
                </span>
              ))}
            </div>
          </div>
          <div className="section-head">
            <h2>Newest applicants</h2>
            <Link to="/recruiter/applicants">See all</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No applicants yet" message="Publish a job and applications will appear here."
              action={<Link to="/recruiter/jobs/new" className="btn btn-primary">Post a job</Link>} />
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Applicant</th><th>Job</th><th>Applied</th><th>Status</th></tr></thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.id}>
                      <td>{a.applicantName}</td><td>{a.jobTitle}</td><td>{formatDate(a.appliedAt)}</td>
                      <td><StatusBadge status={a.status} /><span className="sr-only">{statusLabel(a.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
