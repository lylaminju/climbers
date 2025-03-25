export default function getAveragePosition(entities: { lat: number; lng: number }[]): {
	lat: number;
	lng: number;
} {
	const total = entities.reduce(
		(acc, entity) => ({
			lat: acc.lat + entity.lat,
			lng: acc.lng + entity.lng,
		}),
		{ lat: 0, lng: 0 },
	);
	return {
		lat: total.lat / entities.length,
		lng: total.lng / entities.length,
	};
}
