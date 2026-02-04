// ============================================================================
// Puppeteer-based Web Scraper
// ============================================================================

import puppeteer, { Browser, Page } from 'puppeteer';
import { SCRAPE_CONFIG, BOT_DETECTION_INDICATORS } from './config.js';

let browserInstance: Browser | null = null;

export async function initBrowser(): Promise<Browser> {
	if (!browserInstance) {
		browserInstance = await puppeteer.launch({
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--disable-gpu',
			],
		});
	}
	return browserInstance;
}

export async function closeBrowser(): Promise<void> {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
}

export interface ScrapePageResult {
	html: string | null;
	error?: string;
	statusCode?: number;
	redirectedUrl?: string;
	botDetected?: boolean;
}

export async function scrapePage(
	url: string,
	options: {
		verbose?: boolean;
		screenshotPath?: string;
	} = {}
): Promise<ScrapePageResult> {
	const browser = await initBrowser();
	let page: Page | null = null;

	try {
		page = await browser.newPage();

		// Set a realistic user agent
		await page.setUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);

		// Set viewport
		await page.setViewport({ width: 1280, height: 800 });

		// Listen for response to capture status code
		let statusCode: number | undefined;
		page.on('response', (response) => {
			if (response.url() === url || response.url() === page?.url()) {
				statusCode = response.status();
			}
		});

		if (options.verbose) {
			console.log(`    Navigating to: ${url}`);
		}

		// Navigate to the page
		const response = await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: SCRAPE_CONFIG.navigationTimeout,
		});

		statusCode = response?.status();
		const finalUrl = page.url();

		if (options.verbose && finalUrl !== url) {
			console.log(`    Redirected to: ${finalUrl}`);
		}

		// Check for HTTP errors
		if (statusCode && statusCode >= 400) {
			return {
				html: null,
				error: `HTTP ${statusCode}`,
				statusCode,
			};
		}

		// Get the HTML content
		const html = await page.content();

		// Check for bot detection
		const lowerHtml = html.toLowerCase();
		const botDetected = BOT_DETECTION_INDICATORS.some((indicator) =>
			lowerHtml.includes(indicator.toLowerCase())
		);

		if (botDetected && options.verbose) {
			console.log('    Warning: Possible bot detection');
		}

		// Take screenshot if requested
		if (options.screenshotPath) {
			await page.screenshot({
				path: options.screenshotPath,
				fullPage: true,
			});
			if (options.verbose) {
				console.log(`    Screenshot saved: ${options.screenshotPath}`);
			}
		}

		return {
			html,
			statusCode,
			redirectedUrl: finalUrl !== url ? finalUrl : undefined,
			botDetected,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';

		// Check for specific error types
		if (errorMessage.includes('timeout')) {
			return { html: null, error: 'Timeout' };
		}
		if (errorMessage.includes('net::ERR')) {
			return { html: null, error: 'Network error' };
		}

		return { html: null, error: errorMessage };
	} finally {
		if (page) {
			await page.close();
		}
	}
}

export async function scrapeWithRetry(
	url: string,
	options: {
		verbose?: boolean;
		screenshotPath?: string;
	} = {}
): Promise<ScrapePageResult> {
	let lastResult: ScrapePageResult = { html: null, error: 'No attempts made' };

	for (let attempt = 0; attempt <= SCRAPE_CONFIG.retryAttempts; attempt++) {
		if (attempt > 0) {
			const delay = SCRAPE_CONFIG.retryDelayMs[attempt - 1] || 2000;
			if (options.verbose) {
				console.log(`    Retry ${attempt} after ${delay}ms...`);
			}
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		lastResult = await scrapePage(url, options);

		// Success - return immediately
		if (lastResult.html && !lastResult.error) {
			return lastResult;
		}

		// Don't retry on certain errors
		if (lastResult.statusCode && lastResult.statusCode >= 400) {
			break;
		}
		if (lastResult.botDetected) {
			break;
		}
	}

	return lastResult;
}
