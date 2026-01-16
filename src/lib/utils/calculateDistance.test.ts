import { describe, expect, it } from 'vitest';
import { haversineDistance } from './calculateDistance';

describe('haversineDistance', () => {
	// Boundary: Same point should return 0
	it('returns 0 for same coordinates', () => {
		const coord = { latitude: 43.6532, longitude: -79.3832 };
		expect(haversineDistance(coord, coord)).toBe(0);
	});

	// Known distance: Toronto to Montreal (~503 km)
	it('calculates Toronto to Montreal distance correctly', () => {
		const toronto = { latitude: 43.6532, longitude: -79.3832 };
		const montreal = { latitude: 45.5017, longitude: -73.5673 };
		const distance = haversineDistance(toronto, montreal);
		// Allow 5km tolerance for rounding
		expect(distance).toBeGreaterThan(498);
		expect(distance).toBeLessThan(508);
	});
});
