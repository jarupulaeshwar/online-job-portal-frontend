import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="brand brand-footer">CareerBridge</p>
          <p className="muted-light">
            A college major project: a full-stack job portal built with React, Spring Boot and MySQL.
          </p>
        </div>
        <div>
          <h4>Job seekers</h4>
          <Link to="/jobs">Browse jobs</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/register">Create account</Link>
        </div>
        <div>
          <h4>Recruiters</h4>
          <Link to="/register?role=recruiter">Post a job</Link>
          <Link to="/login">Recruiter login</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p className="muted-light">support@careerbridge.example.com</p>
          <p className="muted-light">Hyderabad, Telangana, India</p>
        </div>
      </div>
      <div className="container footer-note">
        Demonstration listings are sample data. They are not verified vacancies and are not endorsed by any employer.
      </div>
    </footer>
  );
}
