import { describe, expect, it } from 'vitest';
import { formatShortDate, formatTimeToAMPM } from './formatString';

describe('formatTimeToAMPM', () => {
	it('handles midnight (00:00)', () => {
		expect(formatTimeToAMPM('00:00')).toBe('12:00 AM');
	});

	it('handles noon (12:00)', () => {
		expect(formatTimeToAMPM('12:00')).toBe('12:00 PM');
	});

	it('returns empty string for null/undefined', () => {
		expect(formatTimeToAMPM(null)).toBe('');
		expect(formatTimeToAMPM(undefined)).toBe('');
	});
});

describe('formatShortDate', () => {
	it('returns undefined for invalid date', () => {
		expect(formatShortDate('invalid-date')).toBeUndefined();
	});
});
