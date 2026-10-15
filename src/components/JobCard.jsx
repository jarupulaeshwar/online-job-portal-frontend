import { Link } from 'react-router-dom';
import CompanyLogo from './CompanyLogo.jsx';
import Icon from './Icon.jsx';
import {
  experienceLabel,
  formatSalary,
  jobTypeLabel,
  timeAgo,
  workModeLabel,
} from '../utils/format.js';

export default function JobCard({ job, onToggleSave, saving = false }) {
  return (
    <article className="job-card">
      <CompanyLogo name={job.company.name} />
      <div className="job-card-main">
        <h3>
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>
        <p className="job-card-company">
          {job.company.name}
          {job.demo && <span className="badge badge-demo">Demo listing</span>}
          {!job.open && <span className="badge badge-closed">Closed</span>}
        </p>
        <ul className="meta-list">
          <li>
            <Icon name="pin" size={15} /> {job.location}
          </li>
          <li>
            <Icon name="rupee" size={15} /> {formatSalary(job.salaryMin, job.salaryMax)}
          </li>
          <li>
            <Icon name="briefcase" size={15} /> {jobTypeLabel(job.jobType)} &middot; {workModeLabel(job.workMode)}
          </li>
          <li>
            <Icon name="clock" size={15} /> {experienceLabel(job.experienceLevel)}
          </li>
        </ul>
        <div className="chips">
          {(job.skills || []).slice(0, 5).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="job-card-side">
        <span className="muted small">{timeAgo(job.createdAt)}</span>
        {onToggleSave && (
          <button
            type="button"
            className={`btn btn-ghost btn-icon save-btn ${job.saved ? 'is-saved' : ''}`}
            aria-pressed={Boolean(job.saved)}
            aria-label={job.saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            disabled={saving}
            onClick={() => onToggleSave(job)}
          >
            <Icon name="heart" />
          </button>
        )}
      </div>
    </article>
  );
}
