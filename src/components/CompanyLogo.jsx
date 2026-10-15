import { colorFor, initials } from '../utils/format.js';

/** A coloured tile with the company initials, so no image files are needed. */
export default function CompanyLogo({ name, size = 48 }) {
  return (
    <div
      className="company-logo"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
