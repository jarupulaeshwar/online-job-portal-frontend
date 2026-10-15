import { useEffect, useRef, useState } from 'react';
import { seekerApi } from '../../api/index.js';
import { api_error } from '../../api/helpers.js';
import Alert from '../../components/Alert.jsx';
import DashboardNav from '../../components/DashboardNav.jsx';
import ResumeButtons from '../../components/ResumeButtons.jsx';
import Spinner from '../../components/Spinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import { SEEKER_NAV } from './nav.js';

const MAX_BYTES = 5 * 1024 * 1024;

export default function ResumeManagement() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    seekerApi.profile()
      .then(setProfile)
      .catch((err) => setError(api_error(err, 'Could not load your resume details.')))
      .finally(() => setLoading(false));
  }, []);

  const choose = (e) => {
    const picked = e.target.files?.[0];
    setError('');
    if (!picked) { setFile(null); return; }
    if (!picked.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.'); setFile(null); return;
    }
    if (picked.size > MAX_BYTES) {
      setError('The file is larger than 5 MB.'); setFile(null); return;
    }
    setFile(picked);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const updated = await seekerApi.uploadResume(file);
      setProfile(updated);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      toast.success('Resume uploaded.');
    } catch (err) {
      setError(api_error(err, 'Could not upload your resume.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="container section">
      <h1>Resume</h1>
      <DashboardNav items={SEEKER_NAV} />
      <Alert>{error}</Alert>
      <div className="card">
        <h2>Current resume</h2>
        {profile?.hasResume ? (
          <>
            <p><strong>{profile.resumeOriginalName}</strong></p>
            <p className="muted small">
              {(profile.resumeSize / 1024).toFixed(0)} KB &middot; uploaded {formatDate(profile.resumeUploadedAt)}
            </p>
            <ResumeButtons fetchBlob={seekerApi.resumeBlob} filename={profile.resumeOriginalName} />
          </>
        ) : (
          <p className="muted">You have not uploaded a resume yet. Employers need one to review your application.</p>
        )}
      </div>
      <div className="card">
        <h2>{profile?.hasResume ? 'Replace resume' : 'Upload resume'}</h2>
        <p className="muted">PDF only, up to 5 MB. Applications you already sent keep the resume you submitted at the time.</p>
        <label htmlFor="resume-file" className="sr-only">Choose a PDF resume</label>
        <input id="resume-file" ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={choose} />
        <div className="btn-row">
          <button type="button" className="btn btn-primary" disabled={!file || busy} onClick={upload}>
            {busy ? 'Uploading...' : 'Upload resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
