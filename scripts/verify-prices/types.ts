// ============================================================================
// Types for Price Verification Scraper
// ============================================================================

export interface ExtractedPrice {
	amount: number;
	currency: string;
	confidence: 'high' | 'medium' | 'low';
	source: string; // Which extraction strategy found this price
}

export interface ScrapeResult {
	gymId: string;
	gymName: string;
	status: 'success' | 'failed' | 'skipped';
	storedPrice: number | null;
	extractedPrice: ExtractedPrice | null;
	scrapedUrl: string | null;
	error?: string;
}

export interface VerificationReport {
	timestamp: string;
	environment: 'test' | 'prod';
	summary: {
		total: number;
		matched: number;
		mismatched: number;
		failed: number;
		skipped: number;
	};
	matched: ScrapeResult[];
	mismatched: ScrapeResult[];
	failed: ScrapeResult[];
	skipped: ScrapeResult[];
}

export interface GymRecord {
	gym_id: string;
	name: string;
	price_amount: number | null;
	price_source_url: string | null;
	website_url: string | null;
}

export interface CliOptions {
	env: 'test' | 'prod';
	dryRun: boolean;
	gymId: string | null;
	verbose: boolean;
	screenshots: boolean;
}
