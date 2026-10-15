import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seekerApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, statusLabel } from '../../utils/format.js';
import { SEEKER_NAV } from './nav.js';

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([seekerApi.stats(), seekerApi.myApplications()])
      .then(([s, a]) => { setStats(s); setApps(a.slice(0, 5)); })
      .catch((err) => setError(api_error(err, 'Could not load your dashboard.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section">
      <h1>Hello, {user.fullName}</h1>
      <DashboardNav items={SEEKER_NAV} />
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : stats && (
        <>
          {!stats.profileComplete && (
            <Alert type="info">
              Your profile is incomplete (missing: {stats.missingFields.join(', ')}). You must finish it before applying.{' '}
              <Link to="/seeker/profile">Complete profile</Link>
            </Alert>
          )}
          <div className="stat-grid">
            <div className="stat"><span className="stat-value">{stats.applicationsTotal}</span><span>Applications</span></div>
            <div className="stat"><span className="stat-value">{stats.applicationsByStatus.UNDER_REVIEW + stats.applicationsByStatus.SHORTLISTED}</span><span>In progress</span></div>
            <div className="stat"><span className="stat-value">{stats.applicationsByStatus.HIRED}</span><span>Offers</span></div>
            <div className="stat"><span className="stat-value">{stats.savedJobs}</span><span>Saved jobs</span></div>
          </div>

          <div className="section-head"><h2>Recent applications</h2><Link to="/seeker/applications">See all</Link></div>
          {apps.length === 0 ? (
            <EmptyState title="You have not applied yet" message="Find a role that matches your skills and apply in a few clicks."
              action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
                <tbody>
                  {apps.map((a) => (
                    <tr key={a.id}>
                      <td><Link to={`/jobs/${a.job.id}`}>{a.job.title}</Link></td>
                      <td>{a.job.company.name}</td>
                      <td>{formatDate(a.appliedAt)}</td>
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
