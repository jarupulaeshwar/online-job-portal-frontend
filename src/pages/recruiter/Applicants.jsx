import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recruiterApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import ResumeButtons from '../../components/ResumeButtons.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { APPLICATION_STATUSES, formatDate, statusLabel } from '../../utils/format.js';
import { RECRUITER_NAV } from './nav.js';

export default function Applicants() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const jobId = params.get('jobId') || '';
  const status = params.get('status') || '';
  const page = Number(params.get('page') || '0') || 0;

  const [jobs, setJobs] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // application id
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    recruiterApi.jobs().then(setJobs).catch(() => setJobs([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    recruiterApi
      .applications({ jobId: jobId || undefined, status: status || undefined, page, size: 10 })
      .then((d) => { setData(d); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load applicants.')))
      .finally(() => setLoading(false));
  }, [jobId, status, page]);
  useEffect(() => { load(); }, [load]);

  const loadDetail = useCallback((id) => {
    setDetailError('');
    recruiterApi.application(id)
      .then(setDetail)
      .catch((err) => setDetailError(api_error(err, 'Could not load this applicant.')));
  }, []);

  const open = (id) => { setSelected(id); setDetail(null); setNote(''); loadDetail(id); };
  const close = () => { setSelected(null); setDetail(null); };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const changeStatus = async (next) => {
    setBusy(true);
    try {
      await recruiterApi.updateStatus(selected, next);
      toast.success(`Status changed to ${statusLabel(next).toLowerCase()}.`);
      loadDetail(selected);
      load();
    } catch (err) {
      toast.error(api_error(err, 'Could not change the status.'));
      loadDetail(selected);
    } finally {
      setBusy(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    try {
      await recruiterApi.addNote(selected, note.trim());
      setNote('');
      loadDetail(selected);
    } catch (err) {
      toast.error(api_error(err, 'Could not save the note.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container section">
      <h1>Applicants</h1>
      <DashboardNav items={RECRUITER_NAV} />
      <div className="filter-bar">
        <label>Job{' '}
          <select value={jobId} onChange={(e) => setFilter('jobId', e.target.value)}>
            <option value="">All jobs</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </label>
        <label>Status{' '}
          <select value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </label>
      </div>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : data?.content.length ? (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Applicant</th><th>Job</th><th>Applied</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {data.content.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.applicantName}</strong><div className="muted small">{a.applicantEmail}</div></td>
                    <td>{a.jobTitle}</td>
                    <td>{formatDate(a.appliedAt)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => open(a.id)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages}
            onChange={(p) => { const next = new URLSearchParams(params); next.set('page', String(p)); setParams(next); }} />
        </>
      ) : (
        <EmptyState title="No applicants found" message="Applications for your jobs will appear here. Try clearing the filters." />
      )}

      <Modal open={Boolean(selected)} wide title="Applicant" onClose={close}>
        <Alert>{detailError}</Alert>
        {!detail && !detailError && <Spinner />}
        {detail && (
          <div className="applicant-detail">
            <div className="applicant-head">
              <div>
                <h3>{detail.profile.fullName}</h3>
                <p className="muted">{detail.profile.email}{detail.profile.phone ? ` \u00B7 ${detail.profile.phone}` : ''}{detail.profile.location ? ` \u00B7 ${detail.profile.location}` : ''}</p>
                <p className="small">Applied for <strong>{detail.application.jobTitle}</strong> on {formatDate(detail.application.appliedAt)}</p>
              </div>
              <StatusBadge status={detail.application.status} />
            </div>

            {detail.resumeOriginalName && (
              <ResumeButtons fetchBlob={() => recruiterApi.resumeBlob(selected)} filename={detail.resumeOriginalName} />
            )}

            <h4>Change status</h4>
            {detail.application.allowedNext.length === 0 ? (
              <p className="muted small">This application is {statusLabel(detail.application.status).toLowerCase()} and can no longer be changed.</p>
            ) : (
              <div className="btn-row">
                {detail.application.allowedNext.map((s) => (
                  <button key={s} type="button" disabled={busy}
                    className={`btn btn-sm ${s === 'REJECTED' ? 'btn-danger-ghost' : 'btn-primary'}`}
                    onClick={() => changeStatus(s)}>
                    Mark as {statusLabel(s).toLowerCase()}
                  </button>
                ))}
              </div>
            )}

            {detail.coverLetter && (<><h4>Cover letter</h4><p className="prewrap">{detail.coverLetter}</p></>)}
            {detail.profile.summary && (<><h4>Summary</h4><p className="prewrap">{detail.profile.summary}</p></>)}
            {detail.profile.skills && (<><h4>Skills</h4><div className="chips">{detail.profile.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s) => <span key={s} className="chip">{s}</span>)}</div></>)}
            {detail.profile.education && (<><h4>Education</h4><p className="prewrap">{detail.profile.education}</p></>)}
            {detail.profile.experience && (<><h4>Experience</h4><p className="prewrap">{detail.profile.experience}</p></>)}

            <h4>Private notes</h4>
            <p className="muted small">Only recruiters on your account can see these notes. The applicant cannot.</p>
            <form className="inline-form" onSubmit={addNote}>
              <label className="sr-only" htmlFor="note">Add a note</label>
              <input id="note" value={note} maxLength={2000} placeholder="Add a note" onChange={(e) => setNote(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={busy || !note.trim()}>Add note</button>
            </form>
            <ul className="notes">
              {detail.notes.map((n) => (
                <li key={n.id}><span className="muted small">{formatDate(n.createdAt)}</span> {n.note}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
