// Google Places API wrapper for searching climbing gyms

const PLACES_API_BASE = 'https://places.googleapis.com/v1/places';

export interface PlaceResult {
	id: string; // This is the place_id
	displayName: {
		text: string;
		languageCode: string;
	};
	formattedAddress: string;
	location: {
		latitude: number;
		longitude: number;
	};
	websiteUri?: string;
	googleMapsUri?: string;
	businessStatus?: string;
	types?: string[];
}

interface TextSearchResponse {
	places?: PlaceResult[];
	nextPageToken?: string;
}

export class PlacesAPI {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Search for places using text query within a circular area
	 * Automatically paginates to get up to 60 results (3 pages)
	 */
	async searchNearby(
		query: string,
		latitude: number,
		longitude: number,
		radiusMeters: number
	): Promise<PlaceResult[]> {
		const url = `${PLACES_API_BASE}:searchText`;
		const allResults: PlaceResult[] = [];
		let pageToken: string | undefined;

		// Fetch up to 3 pages (max 60 results)
		for (let page = 0; page < 3; page++) {
			const body: Record<string, unknown> = {
				textQuery: query,
				locationBias: {
					circle: {
						center: { latitude, longitude },
						radius: radiusMeters,
					},
				},
			};

			if (pageToken) {
				body.pageToken = pageToken;
			}

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Goog-Api-Key': this.apiKey,
					'X-Goog-FieldMask':
						'places.id,places.displayName,places.formattedAddress,places.location,places.websiteUri,places.googleMapsUri,places.businessStatus,places.types,nextPageToken',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Places API error (${response.status}): ${errorText}`);
			}

			const data: TextSearchResponse = await response.json();

			if (data.places) {
				allResults.push(...data.places);
			}

			// Stop if no more pages
			if (!data.nextPageToken) {
				break;
			}

			pageToken = data.nextPageToken;

			// Small delay before next page (API recommendation)
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		return allResults;
	}

}

/**
 * Extract city from a formatted address
 * e.g., "123 Main St, Toronto, ON M5V 1A1, Canada" -> "Toronto"
 */
export function extractCityFromAddress(address: string): string {
	const parts = address.split(',').map((p) => p.trim());
	// Usually: [street, city, province postal, country]
	if (parts.length >= 2) {
		return parts[1];
	}
	return 'Unknown';
}

/**
 * Generate Google Maps URL from place_id
 */
export function generateMapsUrl(placeId: string): string {
	return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}
