// ============================================================================
// Report Generation
// ============================================================================

import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { ScrapeResult, VerificationReport } from './types.js';

export function generateReport(
	results: ScrapeResult[],
	environment: 'test' | 'prod'
): VerificationReport {
	const matched: ScrapeResult[] = [];
	const mismatched: ScrapeResult[] = [];
	const failed: ScrapeResult[] = [];
	const skipped: ScrapeResult[] = [];

	for (const result of results) {
		switch (result.status) {
			case 'skipped':
				skipped.push(result);
				break;
			case 'failed':
				failed.push(result);
				break;
			case 'success':
				if (result.extractedPrice && result.storedPrice !== null) {
					if (result.extractedPrice.amount === result.storedPrice) {
						matched.push(result);
					} else {
						mismatched.push(result);
					}
				} else {
					failed.push(result);
				}
				break;
		}
	}

	return {
		timestamp: new Date().toISOString(),
		environment,
		summary: {
			total: results.length,
			matched: matched.length,
			mismatched: mismatched.length,
			failed: failed.length,
			skipped: skipped.length,
		},
		matched,
		mismatched,
		failed,
		skipped,
	};
}

export function saveReport(report: VerificationReport): string {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const outputPath = resolve(__dirname, 'verification-report.json');

	writeFileSync(outputPath, JSON.stringify(report, null, 2));
	return outputPath;
}

export function printSummary(report: VerificationReport): void {
	const { summary } = report;

	console.log('\n' + '='.repeat(60));
	console.log('VERIFICATION SUMMARY');
	console.log('='.repeat(60));
	console.log(`Timestamp:   ${report.timestamp}`);
	console.log(`Environment: ${report.environment}`);
	console.log('-'.repeat(60));
	console.log(`Total gyms:  ${summary.total}`);
	console.log(`Matched:     ${summary.matched} (prices match stored values)`);
	console.log(`Mismatched:  ${summary.mismatched} (prices differ)`);
	console.log(`Failed:      ${summary.failed} (could not extract price)`);
	console.log(`Skipped:     ${summary.skipped} (no URL available)`);
	console.log('='.repeat(60));

	// Print mismatched details
	if (report.mismatched.length > 0) {
		console.log('\nMISMATCHED PRICES:');
		console.log('-'.repeat(60));
		for (const result of report.mismatched) {
			console.log(`\n  ${result.gymName} (ID: ${result.gymId})`);
			console.log(`    Stored:    $${result.storedPrice}`);
			console.log(
				`    Extracted: $${result.extractedPrice?.amount} (${result.extractedPrice?.confidence} confidence)`
			);
			console.log(`    URL: ${result.scrapedUrl}`);
		}
	}

	// Print failed details
	if (report.failed.length > 0) {
		console.log('\nFAILED EXTRACTIONS:');
		console.log('-'.repeat(60));
		for (const result of report.failed) {
			console.log(`\n  ${result.gymName} (ID: ${result.gymId})`);
			console.log(`    Error: ${result.error || 'Could not extract price'}`);
			if (result.scrapedUrl) {
				console.log(`    URL: ${result.scrapedUrl}`);
			}
		}
	}

	// Print skipped details
	if (report.skipped.length > 0) {
		console.log('\nSKIPPED (no URL):');
		console.log('-'.repeat(60));
		for (const result of report.skipped) {
			console.log(`  - ${result.gymName} (ID: ${result.gymId})`);
		}
	}
}
