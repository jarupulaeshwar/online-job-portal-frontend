import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JobCard from '../components/JobCard.jsx';

const job = {
  id: 7,
  title: 'Java Backend Developer',
  location: 'Pune, Maharashtra',
  salaryMin: 1000000,
  salaryMax: 1800000,
  jobType: 'FULL_TIME',
  workMode: 'HYBRID',
  experienceLevel: 'MID',
  skills: ['Java 17', 'Spring Boot'],
  open: true,
  demo: true,
  saved: false,
  createdAt: new Date().toISOString(),
  company: { id: 3, name: 'BlueRiver Systems' },
};

describe('JobCard', () => {
  it('shows the key job details and a link to the details page', () => {
    render(<MemoryRouter><JobCard job={job} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Java Backend Developer' })).toHaveAttribute('href', '/jobs/7');
    expect(screen.getByText('BlueRiver Systems')).toBeInTheDocument();
    expect(screen.getByText(/10 - 18 LPA/)).toBeInTheDocument();
    expect(screen.getByText('Demo listing')).toBeInTheDocument();
    expect(screen.getByText('Spring Boot')).toBeInTheDocument();
  });

  it('marks closed jobs', () => {
    render(<MemoryRouter><JobCard job={{ ...job, open: false }} /></MemoryRouter>);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('calls onToggleSave when the heart is pressed', async () => {
    const calls = [];
    render(<MemoryRouter><JobCard job={job} onToggleSave={(j) => calls.push(j.id)} /></MemoryRouter>);
    screen.getByRole('button', { name: /Save Java Backend Developer/ }).click();
    expect(calls).toEqual([7]);
  });
});
