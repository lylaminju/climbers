const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
	// Return existing promise if already loading/loaded
	if (loadPromise) return loadPromise;

	// Already loaded
	if (window.google?.maps) {
		return Promise.resolve(window.google.maps);
	}

	// Create single loading promise
	loadPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve(window.google.maps);
		script.onerror = () => {
			loadPromise = null; // Allow retry on failure
			reject(new Error('Failed to load Google Maps'));
		};
		document.head.appendChild(script);
	});

	return loadPromise;
}
