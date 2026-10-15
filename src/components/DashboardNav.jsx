import { NavLink } from 'react-router-dom';

export default function DashboardNav({ items }) {
  return (
    <nav className="dash-nav" aria-label="Dashboard">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end}>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
