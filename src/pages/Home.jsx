import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../api/index.js';
import { api_error } from '../api/helpers.js';
import Alert from '../components/Alert.jsx';
import CompanyCard from '../components/CompanyCard.jsx';
import DemoNotice from '../components/DemoNotice.jsx';
import Icon from '../components/Icon.jsx';
import JobCard from '../components/JobCard.jsx';
import Spinner from '../components/Spinner.jsx';

const CATEGORIES = [
  { label: 'AI and Machine Learning', q: 'machine learning', icon: 'chart' },
  { label: 'Software Development', q: 'developer', icon: 'code' },
  { label: 'Data and Analytics', q: 'data', icon: 'database' },
  { label: 'Cloud and DevOps', q: 'cloud', icon: 'cloud' },
  { label: 'Cybersecurity', q: 'security', icon: 'shield' },
  { label: 'Design and Product', q: 'design', icon: 'palette' },
  { label: 'Marketing', q: 'marketing', icon: 'megaphone' },
  { label: 'Support and QA', q: 'support', icon: 'headset' },
];

const TIPS = [
  { title: 'Tailor your resume to each role', text: 'Move the skills named in the job description to the top of your resume and remove anything unrelated.' },
  { title: 'Show projects, not just skills', text: 'Link a GitHub repository or a live demo. A small finished project says more than a long list of tools.' },
  { title: 'Prepare for the basics', text: 'Revise data structures, SQL and one language in depth, and practise explaining your own projects out loud.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([publicApi.searchJobs({ size: 6, sort: 'newest' }), publicApi.companies({ size: 6 })])
      .then(([j, c]) => {
        setJobs(j.content);
        setCompanies(c.content);
      })
      .catch((err) => setError(api_error(err, 'Could not load jobs.')))
      .finally(() => setLoading(false));
  }, []);

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Find the job that fits the skills you already have.</h1>
            <p className="hero-lead">
              Search roles across Hyderabad, Bengaluru, Chennai, Pune, Mumbai, Delhi NCR and remote teams. Upload your
              resume once and apply in a click.
            </p>
            <form className="hero-search" onSubmit={search} role="search">
              <label className="sr-only" htmlFor="hero-q">Job title, skill or company</label>
              <div className="hero-input">
                <Icon name="search" size={18} />
                <input id="hero-q" placeholder="Job title, skill or company" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <label className="sr-only" htmlFor="hero-loc">Location</label>
              <div className="hero-input">
                <Icon name="pin" size={18} />
                <input id="hero-loc" placeholder="City or remote" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-accent">Search jobs</button>
            </form>
            <p className="hero-popular">
              Popular:{' '}
              {['Java', 'React', 'Python', 'Data Analyst'].map((t) => (
                <Link key={t} to={`/jobs?q=${encodeURIComponent(t)}`}>{t}</Link>
              ))}
            </p>
          </div>
          <div className="hero-panel" aria-hidden="true">
            <div className="hero-ticket">
              <span className="badge badge-demo">Demo listing</span>
              <strong>Java Backend Developer</strong>
              <span>BlueRiver Systems &middot; Pune</span>
              <span>&#8377;10 - 18 LPA &middot; Hybrid</span>
            </div>
            <div className="hero-ticket hero-ticket-2">
              <strong>React Frontend Developer</strong>
              <span>Pixelforge Studio &middot; Mumbai</span>
              <span>&#8377;6 - 12 LPA &middot; Hybrid</span>
            </div>
            <div className="hero-ticket hero-ticket-3">
              <strong>Machine Learning Engineer</strong>
              <span>Vertex Analytics Labs &middot; Remote</span>
              <span>&#8377;15 - 28 LPA &middot; Remote</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Browse by category</h2>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.label} to={`/jobs?q=${encodeURIComponent(c.q)}`} className="category-tile">
              <Icon name={c.icon} size={22} />
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Latest jobs</h2>
          <Link to="/jobs">View all jobs</Link>
        </div>
        <DemoNotice />
        <Alert>{error}</Alert>
        {loading ? <Spinner /> : (
          <div className="job-list">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Companies hiring</h2>
          <Link to="/companies">View all companies</Link>
        </div>
        {!loading && (
          <div className="company-grid">
            {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </section>

      <section className="container section">
        <h2>Career tips</h2>
        <div className="tips-grid">
          {TIPS.map((t) => (
            <article key={t.title} className="card tip">
              <h3>{t.title}</h3>
              <p className="muted">{t.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
