import { Link } from 'react-router-dom';
import CompanyLogo from './CompanyLogo.jsx';
import Icon from './Icon.jsx';

export default function CompanyCard({ company }) {
  return (
    <Link to={`/jobs?companyId=${company.id}`} className="company-card">
      <CompanyLogo name={company.name} size={52} />
      <div>
        <h3>{company.name}</h3>
        <p className="muted small">{company.industry || 'Company'}</p>
        <p className="small">
          <Icon name="pin" size={14} /> {company.location || 'India'}
        </p>
        <p className="small strong">
          {company.openJobs} open {company.openJobs === 1 ? 'job' : 'jobs'}
        </p>
      </div>
    </Link>
  );
}
