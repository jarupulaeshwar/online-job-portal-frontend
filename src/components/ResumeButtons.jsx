import { useState } from 'react';
import { errorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

/** View or download a PDF that is protected by the login token. */
export default function ResumeButtons({ fetchBlob, filename = 'resume.pdf' }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (download) => {
    setBusy(true);
    try {
      const response = await fetchBlob();
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      } else {
        window.open(url, '_blank', 'noopener');
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      let message = errorMessage(err, 'The resume could not be opened.');
      if (err?.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await err.response.data.text()).message || message;
        } catch {
          /* keep default message */
        }
      }
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="btn-row">
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => run(false)}>
        View resume
      </button>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => run(true)}>
        Download
      </button>
    </span>
  );
}
