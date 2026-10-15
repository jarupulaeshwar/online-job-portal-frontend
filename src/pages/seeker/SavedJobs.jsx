import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { seekerApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import JobCard from '../../components/JobCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { SEEKER_NAV } from './nav.js';

export default function SavedJobs() {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    seekerApi.savedJobs()
      .then((j) => { setJobs(j); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load saved jobs.')))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (job) => {
    try {
      await seekerApi.unsaveJob(job.id);
      toast.success('Removed from saved jobs.');
      load();
    } catch (err) {
      toast.error(api_error(err, 'Could not remove this job.'));
    }
  };

  return (
    <div className="container section">
      <h1>Saved jobs</h1>
      <DashboardNav items={SEEKER_NAV} />
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState title="No saved jobs yet" message="Tap the heart on a job to keep it here for later."
          action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
      ) : (
        <div className="job-list">
          {jobs.map((job) => <JobCard key={job.id} job={job} onToggleSave={remove} />)}
        </div>
      )}
    </div>
  );
}
