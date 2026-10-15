import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, statusLabel } from '../../utils/format.js';

const TABS = ['Overview', 'Users', 'Companies', 'Jobs', 'Applications', 'Reports'];

function useList(fetcher, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((d) => { setData(d); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load data.')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

function Overview() {
  const { data, loading, error } = useList(() => adminApi.stats(), []);
  if (loading) return <Spinner />;
  const items = data ? [
    ['Users', data.users], ['Job seekers', data.jobSeekers], ['Recruiters', data.recruiters], ['Companies', data.companies],
    ['Jobs', data.jobsTotal], ['Published jobs', data.jobsPublished], ['Removed jobs', data.jobsRemoved],
    ['Applications', data.applications], ['Open reports', data.openReports],
  ] : [];
  return (
    <>
      <Alert>{error}</Alert>
      <div className="stat-grid">
        {items.map(([label, value]) => (
          <div key={label} className="stat"><span className="stat-value">{value}</span><span>{label}</span></div>
        ))}
      </div>
    </>
  );
}

function Users() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const { data, loading, error, reload } = useList(() => adminApi.users({ q: term || undefined, page, size: 10 }), [term, page]);

  const toggle = async () => {
    try {
      await adminApi.setUserActive(confirm.id, !confirm.active);
      toast.success(confirm.active ? 'Account deactivated.' : 'Account activated.');
      reload();
    } catch (err) {
      toast.error(api_error(err, 'Could not update this account.'));
    } finally {
      setConfirm(null);
    }
  };

  return (
    <>
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); setPage(0); setTerm(q.trim()); }}>
        <label className="sr-only" htmlFor="user-q">Search users</label>
        <input id="user-q" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : data?.content.length ? (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {data.content.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td><td>{u.email}</td><td>{statusLabel(u.role)}</td><td>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge ${u.active ? 'badge-open' : 'badge-closed'}`}>{u.active ? 'Active' : 'Deactivated'}</span></td>
                    <td>
                      <button type="button" className={`btn btn-sm ${u.active ? 'btn-danger-ghost' : 'btn-ghost'}`} onClick={() => setConfirm(u)}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : <EmptyState title="No users found" />}
      <ConfirmDialog open={Boolean(confirm)} danger={confirm?.active}
        title={confirm?.active ? 'Deactivate account?' : 'Activate account?'}
        message={confirm ? (confirm.active ? `${confirm.fullName} will be logged out and cannot sign in until reactivated. Their jobs are hidden from the public.` : `${confirm.fullName} will be able to sign in again.`) : ''}
        confirmLabel={confirm?.active ? 'Deactivate' : 'Activate'} onConfirm={toggle} onCancel={() => setConfirm(null)} />
    </>
  );
}

function Companies() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useList(() => adminApi.companies({ page, size: 10 }), [page]);
  if (loading) return <Spinner />;
  return (
    <>
      <Alert>{error}</Alert>
      {data?.content.length ? (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Open jobs</th></tr></thead>
              <tbody>
                {data.content.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}{c.demo && <span className="badge badge-demo">Demo</span>}</td>
                    <td>{c.industry || '-'}</td><td>{c.location || '-'}</td><td>{c.openJobs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : <EmptyState title="No companies yet" />}
    </>
  );
}

function Jobs() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useList(
    () => adminApi.jobs({ q: term || undefined, status: status || undefined, page, size: 10 }), [term, status, page]);

  const setJobStatus = async (job, next) => {
    try {
      await adminApi.setJobStatus(job.id, next);
      toast.success(`Job ${next === 'REMOVED' ? 'removed' : next === 'PUBLISHED' ? 'published' : 'closed'}.`);
      reload();
    } catch (err) {
      toast.error(api_error(err, 'Could not update this job.'));
    }
  };

  return (
    <>
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); setPage(0); setTerm(q.trim()); }}>
        <label className="sr-only" htmlFor="job-q">Search jobs</label>
        <input id="job-q" placeholder="Search title or company" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="sr-only" htmlFor="job-status">Status</label>
        <select id="job-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All statuses</option>
          {['DRAFT', 'PUBLISHED', 'CLOSED', 'REMOVED'].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : data?.content.length ? (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Applications</th><th>Moderate</th></tr></thead>
              <tbody>
                {data.content.map((j) => (
                  <tr key={j.id}>
                    <td><Link to={`/jobs/${j.id}`}>{j.title}</Link>{j.demo && <span className="badge badge-demo">Demo</span>}</td>
                    <td>{j.company.name}</td>
                    <td><StatusBadge status={j.status} /></td>
                    <td>{j.applicationCount}</td>
                    <td>
                      <div className="btn-row">
                        {j.status !== 'PUBLISHED' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJobStatus(j, 'PUBLISHED')}>Publish</button>}
                        {j.status === 'PUBLISHED' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJobStatus(j, 'CLOSED')}>Close</button>}
                        {j.status !== 'REMOVED' && <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setJobStatus(j, 'REMOVED')}>Remove</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : <EmptyState title="No jobs found" />}
    </>
  );
}

function Applications() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useList(() => adminApi.applications({ page, size: 10 }), [page]);
  if (loading) return <Spinner />;
  return (
    <>
      <Alert>{error}</Alert>
      {data?.content.length ? (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Applicant</th><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
              <tbody>
                {data.content.map((a) => (
                  <tr key={a.id}>
                    <td>{a.applicantName}<div className="muted small">{a.applicantEmail}</div></td>
                    <td>{a.jobTitle}</td><td>{a.companyName}</td><td>{formatDate(a.appliedAt)}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : <EmptyState title="No applications yet" />}
    </>
  );
}

function Reports() {
  const toast = useToast();
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useList(
    () => adminApi.reports({ status: status || undefined, page, size: 10 }), [status, page]);

  const resolve = async (report, newStatus, removeJob) => {
    try {
      await adminApi.resolveReport(report.id, { status: newStatus, removeJob });
      toast.success(removeJob ? 'Report resolved and job removed.' : `Report ${newStatus.toLowerCase()}.`);
      reload();
    } catch (err) {
      toast.error(api_error(err, 'Could not update this report.'));
    }
  };

  return (
    <>
      <div className="filter-bar">
        <label>Show{' '}
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="OPEN">Open reports</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
            <option value="">All</option>
          </select>
        </label>
      </div>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : data?.content.length ? (
        <>
          <div className="stack">
            {data.content.map((r) => (
              <article key={r.id} className="card">
                <div className="application-head">
                  <div>
                    <h3><Link to={`/jobs/${r.jobId}`}>{r.jobTitle}</Link> <span className="muted small">at {r.companyName}</span></h3>
                    <p><strong>{r.reason}</strong>{r.details ? ` - ${r.details}` : ''}</p>
                    <p className="muted small">Reported by {r.reporterEmail} on {formatDate(r.createdAt)} &middot; job is {statusLabel(r.jobStatus).toLowerCase()}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.status === 'OPEN' && (
                  <div className="btn-row">
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => resolve(r, 'RESOLVED', true)}>Remove job and resolve</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolve(r, 'RESOLVED', false)}>Resolve</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolve(r, 'DISMISSED', false)}>Dismiss</button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : <EmptyState title="No reports" message="Reported job listings will appear here." />}
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="container section">
      <h1>Administrator dashboard</h1>
      <div className="dash-nav" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && <Overview />}
      {tab === 'Users' && <Users />}
      {tab === 'Companies' && <Companies />}
      {tab === 'Jobs' && <Jobs />}
      {tab === 'Applications' && <Applications />}
      {tab === 'Reports' && <Reports />}
    </div>
  );
}
