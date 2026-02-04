#!/usr/bin/env npx tsx
// ============================================================================
// Price Verification Script - CLI Entry Point
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

import type { CliOptions, GymRecord, ScrapeResult } from './types.js';
import { scrapeWithRetry, closeBrowser } from './scraper.js';
import { extractPrice } from './price-extractor.js';
import { generateReport, saveReport, printSummary } from './report.js';

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		env: 'test',
		dryRun: false,
		gymId: null,
		verbose: false,
		screenshots: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--env' && args[i + 1]) {
			const value = args[i + 1];
			if (value === 'test' || value === 'prod') {
				options.env = value;
			} else {
				console.error(`Invalid --env value: ${value}. Use: test or prod`);
				process.exit(1);
			}
			i++;
		} else if (arg === '--dry-run') {
			options.dryRun = true;
		} else if (arg === '--gym-id' && args[i + 1]) {
			options.gymId = args[i + 1];
			i++;
		} else if (arg === '--verbose') {
			options.verbose = true;
		} else if (arg === '--screenshots') {
			options.screenshots = true;
		} else if (arg === '--help' || arg === '-h') {
			printHelp();
			process.exit(0);
		}
	}

	return options;
}

function printHelp(): void {
	console.log(`
Price Verification Script

Usage: npx tsx scripts/verify-prices/index.ts [options]

Options:
  --env test|prod    Target database (default: test)
  --dry-run          Report only, no updates
  --gym-id <uuid>    Verify single gym by UUID
  --verbose          Show detailed logging
  --screenshots      Save screenshots for debugging
  --help, -h         Show this help message

Examples:
  npx tsx scripts/verify-prices/index.ts --env test --dry-run
  npx tsx scripts/verify-prices/index.ts --env prod --gym-id 03f292e1-477d-4bcd-9b17-5725c075a062
  npx tsx scripts/verify-prices/index.ts --env test --verbose --screenshots
`);
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

	return { url, key };
}

// ============================================================================
// Database Operations
// ============================================================================

async function fetchGyms(
	supabase: SupabaseClient,
	gymId: string | null
): Promise<GymRecord[]> {
	let query = supabase
		.from('gym')
		.select('gym_id, name, price_amount, price_source_url, website_url');

	if (gymId !== null) {
		query = query.eq('gym_id', gymId);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching gyms:', error);
		throw error;
	}

	return data as GymRecord[];
}

// ============================================================================
// Verification Logic
// ============================================================================

async function verifyGym(
	gym: GymRecord,
	options: CliOptions,
	screenshotDir: string
): Promise<ScrapeResult> {
	const url = gym.price_source_url || gym.website_url;

	// Skip if no URL available
	if (!url) {
		return {
			gymId: gym.gym_id,
			gymName: gym.name,
			status: 'skipped',
			storedPrice: gym.price_amount,
			extractedPrice: null,
			scrapedUrl: null,
			error: 'No URL available',
		};
	}

	if (options.verbose) {
		console.log(`\n  Processing: ${gym.name} (ID: ${gym.gym_id})`);
	}

	// Scrape the page
	const screenshotPath = options.screenshots
		? resolve(screenshotDir, `gym-${gym.gym_id}.png`)
		: undefined;

	const scrapeResult = await scrapeWithRetry(url, {
		verbose: options.verbose,
		screenshotPath,
	});

	// Handle scrape failure
	if (!scrapeResult.html) {
		return {
			gymId: gym.gym_id,
			gymName: gym.name,
			status: 'failed',
			storedPrice: gym.price_amount,
			extractedPrice: null,
			scrapedUrl: url,
			error: scrapeResult.error || 'Failed to fetch page',
		};
	}

	// Extract price from HTML
	const extractedPrice = extractPrice(scrapeResult.html, options.verbose);

	// If we couldn't extract and bot detection was triggered, report as bot block
	if (!extractedPrice) {
		const error = scrapeResult.botDetected
			? 'Bot detection - manual verification needed'
			: 'Could not extract price';
		return {
			gymId: gym.gym_id,
			gymName: gym.name,
			status: 'failed',
			storedPrice: gym.price_amount,
			extractedPrice: null,
			scrapedUrl: url,
			error,
		};
	}

	// Success
	return {
		gymId: gym.gym_id,
		gymName: gym.name,
		status: 'success',
		storedPrice: gym.price_amount,
		extractedPrice,
		scrapedUrl: url,
	};
}

// ============================================================================
// Main
// ============================================================================

async function main() {
	console.log('=== Price Verification Script ===\n');

	const options = parseArgs();

	console.log(`Environment: ${options.env}`);
	console.log(`Mode: ${options.dryRun ? 'Dry run (report only)' : 'Verification'}`);
	if (options.gymId !== null) {
		console.log(`Target gym ID: ${options.gymId}`);
	}
	if (options.verbose) {
		console.log('Verbose mode: enabled');
	}
	if (options.screenshots) {
		console.log('Screenshots: enabled');
	}
	console.log('');

	// Load environment and create Supabase client
	const { url, key } = loadEnv(options.env);
	const supabase = createClient(url, key);

	// Set up screenshot directory
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const screenshotDir = resolve(__dirname, 'screenshots');
	if (options.screenshots && !existsSync(screenshotDir)) {
		mkdirSync(screenshotDir, { recursive: true });
	}

	// Fetch gyms to verify
	console.log('Fetching gyms from database...');
	const gyms = await fetchGyms(supabase, options.gymId);
	console.log(`Found ${gyms.length} gym(s) to verify\n`);

	if (gyms.length === 0) {
		console.log('No gyms to process.');
		return;
	}

	// Process each gym
	const results: ScrapeResult[] = [];
	let processed = 0;

	for (const gym of gyms) {
		const result = await verifyGym(gym, options, screenshotDir);
		results.push(result);
		processed++;

		// Progress indicator (non-verbose mode)
		if (!options.verbose) {
			const statusIcon =
				result.status === 'success'
					? '✓'
					: result.status === 'skipped'
						? '○'
						: '✗';
			console.log(`  [${processed}/${gyms.length}] ${statusIcon} ${gym.name}`);
		}
	}

	// Close browser
	await closeBrowser();

	// Generate and save report
	const report = generateReport(results, options.env);
	const reportPath = saveReport(report);

	// Print summary
	printSummary(report);
	console.log(`\nFull report saved to: ${reportPath}`);

	// Exit with error code if there were mismatches (for CI)
	if (report.summary.mismatched > 0) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	closeBrowser().finally(() => process.exit(1));
});
