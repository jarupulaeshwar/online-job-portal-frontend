import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: null, login: mocks.login }),
  ROLE_HOME: { JOB_SEEKER: '/seeker', RECRUITER: '/recruiter', ADMIN: '/admin' },
}));

import Login from '../pages/Login.jsx';

function setup() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/seeker" element={<div>Seeker dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  beforeEach(() => mocks.login.mockReset());

  it('shows validation messages and does not call the API for an empty form', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format before calling the API', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('shows the server error and no success when the login fails', async () => {
    mocks.login.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid email or password.' } } });
    setup();
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass1');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.queryByText('Seeker dashboard')).not.toBeInTheDocument();
  });

  it('goes to the dashboard after a successful login', async () => {
    mocks.login.mockResolvedValue({ role: 'JOB_SEEKER' });
    setup();
    await userEvent.type(screen.getByLabelText('Email'), ' a@b.com ');
    await userEvent.type(screen.getByLabelText('Password'), 'Passw0rd1');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(screen.getByText('Seeker dashboard')).toBeInTheDocument());
    expect(mocks.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'Passw0rd1' });
  });
});
