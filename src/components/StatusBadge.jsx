import { statusLabel } from '../utils/format.js';

export default function StatusBadge({ status }) {
  return <span className={`badge status-${(status || '').toLowerCase()}`}>{statusLabel(status)}</span>;
}
