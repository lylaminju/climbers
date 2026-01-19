import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { ONTARIO_REGIONS, SEARCH_QUERY, EXCLUDED_PLACE_IDS } from './config.js';
import {
	PlacesAPI,
	extractCityFromAddress,
	generateMapsUrl,
} from './places-api.js';

// ============================================================================
// Types
// ============================================================================

interface ExistingGym {
	gym_id: number;
	name: string;
	place_id: string;
	address: string;
	city: string;
}

interface NewGymCandidate {
	placeId: string;
	name: string;
	address: string;
	city: string;
	latitude: number;
	longitude: number;
	websiteUrl?: string;
	mapsUrl: string;
	types: string[];
}

interface PotentiallyClosedGym {
	gymId: number;
	name: string;
	placeId: string;
	address: string;
	city: string;
}

interface SyncResults {
	timestamp: string;
	newGymCandidates: NewGymCandidate[];
	potentiallyClosedGyms: PotentiallyClosedGym[];
	existingGymsCount: number;
	apiCallsMade: number;
}

// Types that indicate obvious non-climbing-gym places
const EXCLUDED_TYPES = [
	'park',
	'store',
	'university',
	'school',
	'shopping_mall',
	'library',
	'museum',
	'community_center',
	'playground',
	'amusement_center',
	'hotel',
	'lodging',
	'bowling_alley',
	'spa',
	'sauna',
	'massage',
	'video_arcade',
	'ice_skating_rink',
	'arena',
	'roller_coaster',
];

// ============================================================================
// Main Script
// ============================================================================

async function main() {
	console.log('=== Gym Sync Script ===\n');

	// Validate environment variables
	const apiKey = process.env.GOOGLE_PLACE_API_KEY;
	const supabaseUrl = process.env.VITE_SUPABASE_URL;
	const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

	if (!apiKey) {
		console.error(
			'Error: GOOGLE_PLACE_API_KEY environment variable is required'
		);
		process.exit(1);
	}

	if (!supabaseUrl || !supabaseKey) {
		console.error(
			'Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required'
		);
		process.exit(1);
	}

	const places = new PlacesAPI(apiKey);
	const supabase = createClient(supabaseUrl, supabaseKey);

	let apiCallsMade = 0;

	// Step 1: Load existing gyms from Supabase
	console.log('Loading existing gyms from Supabase...');
	const { data: existingGyms, error } = await supabase
		.from('gym')
		.select('gym_id, name, place_id, address, city');

	if (error) {
		console.error('Error loading gyms from Supabase:', error);
		process.exit(1);
	}

	const existingByPlaceId = new Map(
		(existingGyms as ExistingGym[]).map((g) => [g.place_id, g])
	);
	console.log(`Found ${existingGyms.length} existing gyms in database\n`);

	// Step 2: Search for climbing gyms in Ontario (2 API calls)
	console.log('Searching for climbing gyms via Google Places API...\n');

	const foundPlaceIds = new Set<string>();
	const newGymCandidates: NewGymCandidate[] = [];

	for (const region of ONTARIO_REGIONS) {
		console.log(`  Searching ${region.name}...`);
		try {
			const results = await places.searchNearby(
				SEARCH_QUERY,
				region.latitude,
				region.longitude,
				region.radius
			);
			apiCallsMade++;
			console.log(`    Found ${results.length} results`);

			for (const place of results) {
				// Track all found place IDs
				foundPlaceIds.add(place.id);

				// Skip if already in our database
				if (existingByPlaceId.has(place.id)) {
					continue;
				}

				// Skip known false positives
				if (EXCLUDED_PLACE_IDS.includes(place.id)) {
					continue;
				}

				// Skip if business is permanently closed
				if (place.businessStatus === 'CLOSED_PERMANENTLY') {
					continue;
				}

				// Skip duplicates from overlapping searches
				if (newGymCandidates.some((g) => g.placeId === place.id)) {
					continue;
				}

				// Filter out obvious non-gym types
				const placeTypes = place.types ?? [];
				const isExcludedType = placeTypes.some((t) =>
					EXCLUDED_TYPES.includes(t)
				);
				if (isExcludedType) {
					continue;
				}

				newGymCandidates.push({
					placeId: place.id,
					name: place.displayName.text,
					address: place.formattedAddress,
					city: extractCityFromAddress(place.formattedAddress),
					latitude: place.location.latitude,
					longitude: place.location.longitude,
					websiteUrl: place.websiteUri,
					mapsUrl: place.googleMapsUri || generateMapsUrl(place.id),
					types: placeTypes,
				});
			}
		} catch (err) {
			console.error(`    Error searching ${region.name}:`, err);
		}
	}

	// Step 3: Find potentially closed gyms (in DB but not found in search)
	const potentiallyClosedGyms: PotentiallyClosedGym[] = [];

	for (const gym of existingGyms as ExistingGym[]) {
		if (!gym.place_id) continue;

		if (!foundPlaceIds.has(gym.place_id)) {
			potentiallyClosedGyms.push({
				gymId: gym.gym_id,
				name: gym.name,
				placeId: gym.place_id,
				address: gym.address,
				city: gym.city,
			});
		}
	}

	// Step 4: Generate report
	const results: SyncResults = {
		timestamp: new Date().toISOString(),
		newGymCandidates,
		potentiallyClosedGyms,
		existingGymsCount: existingGyms.length,
		apiCallsMade,
	};

	printReport(results);

	// Save to JSON file
	const outputPath = 'sync-results.json';
	writeFileSync(outputPath, JSON.stringify(results, null, 2));
	console.log(`\nFull results saved to: ${outputPath}`);
}

// ============================================================================
// Helpers
// ============================================================================

function printReport(results: SyncResults) {
	console.log('\n' + '='.repeat(50));
	console.log('=== Gym Sync Report ===');
	console.log('='.repeat(50) + '\n');

	console.log(`Timestamp: ${results.timestamp}`);
	console.log(`Existing gyms in database: ${results.existingGymsCount}`);
	console.log(`API calls made: ${results.apiCallsMade}\n`);

	// NewGymCandidates
	console.log('-'.repeat(50));
	console.log(`CANDIDATES (${results.newGymCandidates.length}):`);
	console.log('-'.repeat(50));

	if (results.newGymCandidates.length === 0) {
		console.log('  None found\n');
	} else {
		results.newGymCandidates.forEach((gym, i) => {
			console.log(`\n${i + 1}. ${gym.name}`);
			console.log(`   Address: ${gym.address}`);
			console.log(`   City: ${gym.city}`);
			console.log(`   Types: ${gym.types.join(', ')}`);
			console.log(`   place_id: ${gym.placeId}`);
			if (gym.websiteUrl) {
				console.log(`   Website: ${gym.websiteUrl}`);
			}
			console.log(`   Maps: ${gym.mapsUrl}`);
		});
		console.log('');
	}

	// Potentially closed
	console.log('-'.repeat(50));
	console.log(`POTENTIALLY CLOSED (${results.potentiallyClosedGyms.length}):`);
	console.log('-'.repeat(50));

	if (results.potentiallyClosedGyms.length === 0) {
		console.log('  None\n');
	} else {
		results.potentiallyClosedGyms.forEach((gym, i) => {
			console.log(`\n${i + 1}. ${gym.name}`);
			console.log(`   Address: ${gym.address}`);
			console.log(`   City: ${gym.city}`);
			console.log(`   place_id: ${gym.placeId}`);
		});
		console.log('');
	}
}

// Run the script
main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
