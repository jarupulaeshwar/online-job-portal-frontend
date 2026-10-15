import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ROLE_HOME, useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(q.trim() ? `/jobs?q=${encodeURIComponent(q.trim())}` : '/jobs');
  };

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">
            <Icon name="briefcase" size={18} />
          </span>
          CareerBridge
        </Link>

        <button type="button" className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>

        <div className={`nav-panel ${open ? 'is-open' : ''}`}>
          <form className="nav-search" onSubmit={submit} role="search">
            <Icon name="search" size={16} />
            <input type="search" placeholder="Search jobs, skills, companies" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
          </form>
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/jobs" onClick={close}>Browse Jobs</NavLink>
            <NavLink to="/companies" onClick={close}>Companies</NavLink>
            {user && (
              <NavLink to={ROLE_HOME[user.role]} onClick={close}>
                Dashboard
              </NavLink>
            )}
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user" title={user.email}>{user.fullName}</span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={close}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={close}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
