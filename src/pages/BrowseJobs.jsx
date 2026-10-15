import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi, seekerApi } from '../api/index.js';
import { api_error } from '../api/helpers.js';
import Alert from '../components/Alert.jsx';
import DemoNotice from '../components/DemoNotice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import JobCard from '../components/JobCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { EXPERIENCE_LEVELS, JOB_TYPES, WORK_MODES } from '../utils/format.js';

const LAKH = 100000;

export default function BrowseJobs() {
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const get = (key, fallback = '') => params.get(key) || fallback;
  const [draft, setDraft] = useState({
    q: get('q'), location: get('location'), jobType: get('jobType'), experienceLevel: get('experienceLevel'),
    workMode: get('workMode'), minLpa: get('minLpa'), maxLpa: get('maxLpa'),
  });

  // Keep the form in sync when the URL changes (for example from the navbar search).
  useEffect(() => {
    setDraft({
      q: get('q'), location: get('location'), jobType: get('jobType'), experienceLevel: get('experienceLevel'),
      workMode: get('workMode'), minLpa: get('minLpa'), maxLpa: get('maxLpa'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const page = Number(get('page', '0')) || 0;
  const sort = get('sort', 'newest');
  const companyId = get('companyId');

  const load = useCallback(() => {
    setLoading(true);
    const query = {
      q: get('q') || undefined,
      location: get('location') || undefined,
      jobType: get('jobType') || undefined,
      experienceLevel: get('experienceLevel') || undefined,
      workMode: get('workMode') || undefined,
      minSalary: get('minLpa') ? Math.round(Number(get('minLpa')) * LAKH) : undefined,
      maxSalary: get('maxLpa') ? Math.round(Number(get('maxLpa')) * LAKH) : undefined,
      companyId: get('companyId') || undefined,
      sort: get('sort', 'newest'),
      page: Number(get('page', '0')) || 0,
      size: 8,
    };
    publicApi
      .searchJobs(query)
      .then((d) => { setData(d); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load jobs.')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user?.id]);

  useEffect(() => { load(); }, [load]);

  const apply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([k, v]) => v && v.toString().trim() && next.set(k, v.toString().trim()));
    if (sort !== 'newest') next.set('sort', sort);
    if (companyId) next.set('companyId', companyId);
    setParams(next);
  };

  const clear = () => setParams(companyId ? { companyId } : {});

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  };

  const setSort = (value) => {
    const next = new URLSearchParams(params);
    next.set('sort', value);
    next.delete('page');
    setParams(next);
  };

  const toggleSave = async (job) => {
    setSavingId(job.id);
    try {
      if (job.saved) await seekerApi.unsaveJob(job.id);
      else await seekerApi.saveJob(job.id);
      setData((d) => ({ ...d, content: d.content.map((j) => (j.id === job.id ? { ...j, saved: !job.saved } : j)) }));
      toast.success(job.saved ? 'Removed from saved jobs.' : 'Job saved.');
    } catch (err) {
      toast.error(api_error(err, 'Could not update saved jobs.'));
    } finally {
      setSavingId(null);
    }
  };

  const change = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  return (
    <div className="container section">
      <h1>Browse jobs</h1>
      <DemoNotice />
      <div className="browse-layout">
        <form className="card filters" onSubmit={apply}>
          <h2>Filters</h2>
          <label htmlFor="f-q">Keyword</label>
          <input id="f-q" name="q" value={draft.q} onChange={change} placeholder="Title, skill or company" />
          <label htmlFor="f-loc">Location</label>
          <input id="f-loc" name="location" value={draft.location} onChange={change} placeholder="e.g. Pune or Remote" />
          <label htmlFor="f-type">Job type</label>
          <select id="f-type" name="jobType" value={draft.jobType} onChange={change}>
            <option value="">Any</option>
            {JOB_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label htmlFor="f-exp">Experience</label>
          <select id="f-exp" name="experienceLevel" value={draft.experienceLevel} onChange={change}>
            <option value="">Any</option>
            {EXPERIENCE_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label htmlFor="f-mode">Work mode</label>
          <select id="f-mode" name="workMode" value={draft.workMode} onChange={change}>
            <option value="">Any</option>
            {WORK_MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <fieldset className="range">
            <legend>Salary (lakhs per year)</legend>
            <input aria-label="Minimum salary in lakhs" name="minLpa" type="number" min="0" step="0.5" placeholder="Min" value={draft.minLpa} onChange={change} />
            <input aria-label="Maximum salary in lakhs" name="maxLpa" type="number" min="0" step="0.5" placeholder="Max" value={draft.maxLpa} onChange={change} />
          </fieldset>
          <button type="submit" className="btn btn-primary btn-block">Apply filters</button>
          <button type="button" className="btn btn-ghost btn-block" onClick={clear}>Clear all</button>
        </form>

        <section aria-live="polite">
          <div className="results-bar">
            <p className="muted">
              {data ? `${data.totalElements} ${data.totalElements === 1 ? 'job' : 'jobs'} found` : ''}
            </p>
            <label className="sort">
              Sort by{' '}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="relevant">Most relevant</option>
                <option value="salary">Highest salary</option>
              </select>
            </label>
          </div>
          <Alert>{error}</Alert>
          {loading ? <Spinner label="Searching jobs..." /> : data?.content.length ? (
            <>
              <div className="job-list">
                {data.content.map((job) => (
                  <JobCard key={job.id} job={job} saving={savingId === job.id}
                    onToggleSave={user?.role === 'JOB_SEEKER' ? toggleSave : undefined} />
                ))}
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
            </>
          ) : (
            <EmptyState title="No jobs match your search" message="Try fewer filters or a broader keyword."
              action={<button type="button" className="btn btn-primary" onClick={clear}>Clear filters</button>} />
          )}
        </section>
      </div>
    </div>
  );
}
