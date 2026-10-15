import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ value: { user: null, loading: false } }));
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => auth.value,
  ROLE_HOME: { JOB_SEEKER: '/seeker', RECRUITER: '/recruiter', ADMIN: '/admin' },
}));

import ProtectedRoute from '../components/ProtectedRoute.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/seeker" element={<div>Seeker home</div>} />
        <Route path="/recruiter" element={<div>Recruiter home</div>} />
        <Route element={<ProtectedRoute roles={['RECRUITER']} />}>
          <Route path="/recruiter/jobs" element={<div>Manage jobs</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => { auth.value = { user: null, loading: false }; });

  it('sends visitors who are not logged in to the login page', () => {
    renderAt('/recruiter/jobs');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('lets the right role through', () => {
    auth.value = { user: { role: 'RECRUITER' }, loading: false };
    renderAt('/recruiter/jobs');
    expect(screen.getByText('Manage jobs')).toBeInTheDocument();
  });

  it('redirects the wrong role to its own dashboard', () => {
    auth.value = { user: { role: 'JOB_SEEKER' }, loading: false };
    renderAt('/recruiter/jobs');
    expect(screen.getByText('Seeker home')).toBeInTheDocument();
    expect(screen.queryByText('Manage jobs')).not.toBeInTheDocument();
  });

  it('shows a spinner while the session is being restored', () => {
    auth.value = { user: null, loading: true };
    renderAt('/recruiter/jobs');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
