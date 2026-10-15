export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];
export const EXPERIENCE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher (0 years)' },
  { value: 'JUNIOR', label: 'Junior (1-3 years)' },
  { value: 'MID', label: 'Mid level (3-6 years)' },
  { value: 'SENIOR', label: 'Senior (6+ years)' },
];
export const WORK_MODES = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
];
export const APPLICATION_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN'];

const lookup = (list) => Object.fromEntries(list.map((i) => [i.value, i.label]));
const typeLabels = lookup(JOB_TYPES);
const levelLabels = lookup(EXPERIENCE_LEVELS);
const modeLabels = lookup(WORK_MODES);

export const jobTypeLabel = (v) => typeLabels[v] || v;
export const experienceLabel = (v) => levelLabels[v] || v;
export const workModeLabel = (v) => modeLabels[v] || v;

/** "UNDER_REVIEW" -> "Under review" */
export function statusLabel(status) {
  if (!status) return '';
  const text = status.toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const lakh = (n) => {
  const value = n / 100000;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}`;
};

/** Salaries are yearly amounts in INR. Shown in lakhs per annum (LPA). */
export function formatSalary(min, max) {
  if (min == null && max == null) return 'Not disclosed';
  if (min != null && max != null) return `\u20B9${lakh(min)} - ${lakh(max)} LPA`;
  if (min != null) return `From \u20B9${lakh(min)} LPA`;
  return `Up to \u20B9${lakh(max)} LPA`;
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** Gives every company a stable colour from its name. */
export function colorFor(name = '') {
  const colors = ['#1f6feb', '#0b7285', '#6741d9', '#c2255c', '#2b8a3e', '#d9480f', '#364fc7', '#0c8599'];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return colors[hash % colors.length];
}
