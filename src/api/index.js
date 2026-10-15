import api from './client.js';

const data = (promise) => promise.then((r) => r.data);

// ---------- authentication ----------
export const authApi = {
  login: (body) => data(api.post('/api/auth/login', body)),
  registerSeeker: (body) => data(api.post('/api/auth/register/seeker', body)),
  registerRecruiter: (body) => data(api.post('/api/auth/register/recruiter', body)),
  me: () => data(api.get('/api/auth/me')),
  changePassword: (body) => data(api.post('/api/auth/change-password', body)),
};

// ---------- public ----------
export const publicApi = {
  searchJobs: (params) => data(api.get('/api/jobs', { params })),
  getJob: (id) => data(api.get(`/api/jobs/${id}`)),
  companies: (params) => data(api.get('/api/companies', { params })),
  company: (id) => data(api.get(`/api/companies/${id}`)),
};

// ---------- job seeker ----------
export const seekerApi = {
  profile: () => data(api.get('/api/seeker/profile')),
  updateProfile: (body) => data(api.put('/api/seeker/profile', body)),
  uploadResume: (file) => {
    const form = new FormData();
    form.append('file', file);
    return data(api.post('/api/seeker/resume', form));
  },
  resumeBlob: () => api.get('/api/seeker/resume', { responseType: 'blob' }),
  stats: () => data(api.get('/api/seeker/stats')),
  savedJobs: () => data(api.get('/api/saved-jobs')),
  saveJob: (id) => data(api.put(`/api/saved-jobs/${id}`)),
  unsaveJob: (id) => data(api.delete(`/api/saved-jobs/${id}`)),
  apply: (body) => data(api.post('/api/applications', body)),
  myApplications: () => data(api.get('/api/applications/mine')),
  withdraw: (id) => data(api.post(`/api/applications/${id}/withdraw`)),
  applicationResumeBlob: (id) => api.get(`/api/applications/${id}/resume`, { responseType: 'blob' }),
  reportJob: (id, body) => data(api.post(`/api/jobs/${id}/report`, body)),
};

// ---------- recruiter ----------
export const recruiterApi = {
  profile: () => data(api.get('/api/recruiter/profile')),
  updateProfile: (body) => data(api.put('/api/recruiter/profile', body)),
  stats: () => data(api.get('/api/recruiter/stats')),
  jobs: () => data(api.get('/api/recruiter/jobs')),
  job: (id) => data(api.get(`/api/recruiter/jobs/${id}`)),
  createJob: (body) => data(api.post('/api/recruiter/jobs', body)),
  updateJob: (id, body) => data(api.put(`/api/recruiter/jobs/${id}`, body)),
  publishJob: (id) => data(api.post(`/api/recruiter/jobs/${id}/publish`)),
  closeJob: (id) => data(api.post(`/api/recruiter/jobs/${id}/close`)),
  deleteJob: (id) => api.delete(`/api/recruiter/jobs/${id}`),
  applications: (params) => data(api.get('/api/recruiter/applications', { params })),
  application: (id) => data(api.get(`/api/recruiter/applications/${id}`)),
  resumeBlob: (id) => api.get(`/api/recruiter/applications/${id}/resume`, { responseType: 'blob' }),
  updateStatus: (id, status) => data(api.put(`/api/recruiter/applications/${id}/status`, { status })),
  addNote: (id, note) => data(api.post(`/api/recruiter/applications/${id}/notes`, { note })),
};

// ---------- administrator ----------
export const adminApi = {
  stats: () => data(api.get('/api/admin/stats')),
  users: (params) => data(api.get('/api/admin/users', { params })),
  setUserActive: (id, active) => data(api.put(`/api/admin/users/${id}/active`, { active })),
  companies: (params) => data(api.get('/api/admin/companies', { params })),
  jobs: (params) => data(api.get('/api/admin/jobs', { params })),
  setJobStatus: (id, status) => data(api.put(`/api/admin/jobs/${id}/status`, { status })),
  applications: (params) => data(api.get('/api/admin/applications', { params })),
  reports: (params) => data(api.get('/api/admin/reports', { params })),
  resolveReport: (id, body) => data(api.put(`/api/admin/reports/${id}`, body)),
};
