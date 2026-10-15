import { describe, expect, it } from 'vitest';
import { formatSalary, initials, jobTypeLabel, statusLabel } from '../utils/format.js';

describe('format helpers', () => {
  it('formats salary ranges in lakhs per annum', () => {
    expect(formatSalary(600000, 1200000)).toBe('\u20B96 - 12 LPA');
    expect(formatSalary(450000, 700000)).toBe('\u20B94.5 - 7 LPA');
    expect(formatSalary(null, null)).toBe('Not disclosed');
    expect(formatSalary(500000, null)).toBe('From \u20B95 LPA');
  });

  it('turns enum values into readable labels', () => {
    expect(statusLabel('UNDER_REVIEW')).toBe('Under review');
    expect(jobTypeLabel('FULL_TIME')).toBe('Full time');
  });

  it('builds company initials', () => {
    expect(initials('Nimbus Cloudworks')).toBe('NC');
    expect(initials('')).toBe('');
  });
});
