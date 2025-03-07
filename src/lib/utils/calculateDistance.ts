import type { Coordinates } from '$lib/types/types';

export function haversineDistance(coord1: Coordinates, coord2: Coordinates) {
	const { latitude: lat1, longitude: lon1 } = coord1;
	const { latitude: lat2, longitude: lon2 } = coord2;

	const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const R = 6371; // Earth's radius in kilometers

	return R * c; // Distance in kilometers
}
