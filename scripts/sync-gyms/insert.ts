import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Types
// ============================================================================

interface VerifiedGym {
	placeId: string;
	name: string;
	address: string;
	city: string;
	latitude: number;
	longitude: number;
	websiteUrl?: string;
	mapsUrl: string;
	notes?: string;
	price?: { amount: number; currency: string } | null;
	area?: { value: number; unit: string } | null;
	climbingTypes?: {
		boulder: boolean;
		topRope: boolean;
		lead: boolean;
		autoBelay: boolean;
	} | null;
	boards?: {
		moonBoard: boolean;
		kilterBoard: boolean;
		tensionBoard: boolean;
	} | null;
}

interface VerificationResults {
	verificationDate: string;
	realClimbingGyms: VerifiedGym[];
}

interface GymInsert {
	name: string;
	address: string;
	city: string;
	place_id: string;
	latitude: number;
	longitude: number;
	map_url: string;
	website_url: string | null;
	price_currency: string;
	price_amount: number;
	icon_url: string;
	image_url: string;
	area_unit: string;
	area_value: number;
	boulder: boolean;
	auto_belay: boolean;
	top_rope: boolean;
	lead: boolean;
	moon_board: boolean;
	kilter_board: boolean;
	tension_board: boolean;
}

type Environment = 'test' | 'prod' | 'both';

// ============================================================================
// Helpers
// ============================================================================

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): { env: Environment; dryRun: boolean } {
	const args = process.argv.slice(2);
	let env: Environment = 'test';
	let dryRun = false;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--env' && args[i + 1]) {
			const value = args[i + 1];
			if (value === 'test' || value === 'prod' || value === 'both') {
				env = value;
			} else {
				console.error(`Invalid --env value: ${value}. Use: test, prod, or both`);
				process.exit(1);
			}
			i++;
		} else if (args[i] === '--dry-run') {
			dryRun = true;
		}
	}

	return { env, dryRun };
}

// ============================================================================
// Environment Loading
// ============================================================================

function loadEnv(environment: 'test' | 'prod'): { url: string; key: string } {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const envPath = resolve(__dirname, `../../.env.${environment}`);

	// Clear existing env vars to avoid conflicts
	delete process.env.SUPABASE_URL;
	delete process.env.SUPABASE_SECRET_KEY;

	config({ path: envPath, override: true });

	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SECRET_KEY;

	if (!url || !key) {
		console.error(`Error: Missing credentials in .env.${environment}`);
		console.error(`Expected SUPABASE_URL and SUPABASE_SECRET_KEY`);
		console.error(`File path: ${envPath}`);
		process.exit(1);
	}

	// Validate that prod credentials are filled in
	if (environment === 'prod' && (url as string).includes('your-prod-project')) {
		console.error('Error: Production credentials not configured in .env.prod');
		console.error('Please fill in your actual production Supabase URL and key');
		process.exit(1);
	}

	return { url, key };
}

// ============================================================================
// Data Loading
// ============================================================================

function loadVerificationResults(): VerificationResults {
	const __dirname = dirname(fileURLToPath(import.meta.url));

	// Find the most recent verification results file
	const files = readdirSync(__dirname).filter((f: string) =>
		f.startsWith('verification-results-') && f.endsWith('.json')
	);

	if (files.length === 0) {
		console.error('Error: No verification-results-*.json file found');
		process.exit(1);
	}

	// Sort to get most recent
	files.sort().reverse();
	const latestFile = files[0];

	console.log(`Loading: ${latestFile}`);
	const filePath = resolve(__dirname, latestFile);
	const content = readFileSync(filePath, 'utf-8');
	return JSON.parse(content);
}

// ============================================================================
// Insert Logic
// ============================================================================

async function insertGyms(
	environment: 'test' | 'prod',
	gyms: VerifiedGym[],
	dryRun: boolean
): Promise<{ inserted: number; skipped: number }> {
	console.log(`\n${'='.repeat(50)}`);
	console.log(`Inserting to ${environment.toUpperCase()} database`);
	console.log('='.repeat(50));

	const { url, key } = loadEnv(environment);
	const supabase = createClient(url, key);

	// Get existing place_ids
	const { data: existingGyms, error: fetchError } = await supabase
		.from('gym')
		.select('place_id');

	if (fetchError) {
		console.error('Error fetching existing gyms:', fetchError);
		throw fetchError;
	}

	const existingPlaceIds = new Set(
		(existingGyms || []).map((g) => g.place_id)
	);
	console.log(`Found ${existingPlaceIds.size} existing gyms in database`);

	let inserted = 0;
	let skipped = 0;

	for (const gym of gyms) {
		if (existingPlaceIds.has(gym.placeId)) {
			console.log(`  SKIP: ${gym.name} (already exists)`);
			skipped++;
			continue;
		}

		const gymData: GymInsert = {
			name: gym.name,
			address: gym.address,
			city: gym.city,
			place_id: gym.placeId,
			latitude: gym.latitude,
			longitude: gym.longitude,
			map_url: gym.mapsUrl,
			website_url: gym.websiteUrl || null,
			icon_url: `${toSlug(gym.name)}.jpg`,
			image_url: `${toSlug(gym.name)}.jpg`,
			// Pricing
			price_currency: gym.price?.currency ?? 'CAD',
			price_amount: gym.price?.amount ?? 0,
			// Area
			area_unit: gym.area?.unit ?? 'sqft',
			area_value: gym.area?.value ?? 0,
			// Climbing types
			boulder: gym.climbingTypes?.boulder ?? false,
			auto_belay: gym.climbingTypes?.autoBelay ?? false,
			top_rope: gym.climbingTypes?.topRope ?? false,
			lead: gym.climbingTypes?.lead ?? false,
			// Training boards
			moon_board: gym.boards?.moonBoard ?? false,
			kilter_board: gym.boards?.kilterBoard ?? false,
			tension_board: gym.boards?.tensionBoard ?? false,
		};

		if (dryRun) {
			console.log(`  DRY RUN: Would insert ${gym.name}`);
			inserted++;
			continue;
		}

		const { error: insertError } = await supabase.from('gym').insert(gymData);

		if (insertError) {
			console.error(`  ERROR: ${gym.name}:`, insertError.message);
		} else {
			console.log(`  INSERT: ${gym.name}`);
			inserted++;
		}
	}

	return { inserted, skipped };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
	console.log('=== Gym Insert Script ===\n');

	const { env, dryRun } = parseArgs();

	if (dryRun) {
		console.log('DRY RUN MODE - No changes will be made\n');
	}

	console.log(`Target environment: ${env}`);

	// Load verification results
	const results = loadVerificationResults();
	const gyms = results.realClimbingGyms;

	console.log(`Found ${gyms.length} verified gyms to process`);
	console.log(`Verification date: ${results.verificationDate}\n`);

	const summary: { [key: string]: { inserted: number; skipped: number } } = {};

	if (env === 'test' || env === 'both') {
		summary.test = await insertGyms('test', gyms, dryRun);
	}

	if (env === 'prod' || env === 'both') {
		summary.prod = await insertGyms('prod', gyms, dryRun);
	}

	// Print summary
	console.log(`\n${'='.repeat(50)}`);
	console.log('SUMMARY');
	console.log('='.repeat(50));

	for (const [envName, stats] of Object.entries(summary)) {
		console.log(`\n${envName.toUpperCase()}:`);
		console.log(`  Inserted: ${stats.inserted}`);
		console.log(`  Skipped:  ${stats.skipped}`);
	}

	if (dryRun) {
		console.log('\n(Dry run - no actual changes were made)');
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
