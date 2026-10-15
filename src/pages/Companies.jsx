import { useEffect, useState } from 'react';
import { publicApi } from '../api/index.js';
import { api_error } from '../api/helpers.js';
import Alert from '../components/Alert.jsx';
import CompanyCard from '../components/CompanyCard.jsx';
import DemoNotice from '../components/DemoNotice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Companies() {
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    publicApi
      .companies({ q: term || undefined, page, size: 12 })
      .then((d) => { setData(d); setError(''); })
      .catch((err) => setError(api_error(err, 'Could not load companies.')))
      .finally(() => setLoading(false));
  }, [term, page]);

  const submit = (e) => {
    e.preventDefault();
    setPage(0);
    setTerm(q.trim());
  };

  return (
    <div className="container section">
      <h1>Companies</h1>
      <DemoNotice />
      <form className="inline-form" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="company-q">Search companies</label>
        <input id="company-q" placeholder="Search by company or industry" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? <Spinner /> : data?.content.length ? (
        <>
          <div className="company-grid">
            {data.content.map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : (
        <EmptyState title="No companies found" message="Try a different name or industry." />
      )}
    </div>
  );
}
