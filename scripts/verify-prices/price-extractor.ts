// ============================================================================
// Cheerio-based Price Extraction
// ============================================================================

import { load, type CheerioAPI } from 'cheerio';
import {
	PRICE_KEYWORDS,
	PRICE_PATTERN,
	PRICE_SELECTORS,
	PRICE_RANGE,
	EXCLUSION_KEYWORDS,
} from './config.js';
import type { ExtractedPrice } from './types.js';

interface PriceCandidate {
	amount: number;
	context: string;
	source: string;
	score: number;
}

export function extractPrice(
	html: string,
	verbose = false
): ExtractedPrice | null {
	const $ = load(html);
	const candidates: PriceCandidate[] = [];

	// Strategy 1: JSON-LD structured data
	const jsonLdPrices = extractFromJsonLd($, verbose);
	candidates.push(...jsonLdPrices);

	// Strategy 2: Individual text elements (handles Wix/JS sites better)
	const elementPrices = extractFromTextElements($, verbose);
	candidates.push(...elementPrices);

	// Strategy 3: Keyword proximity search (on normalized body text)
	const keywordPrices = extractByKeywordProximity($, verbose);
	candidates.push(...keywordPrices);

	// Strategy 4: Table/list rows with pricing
	const tablePrices = extractFromTables($, verbose);
	candidates.push(...tablePrices);

	// Strategy 5: CSS class patterns
	const cssPrices = extractByCssSelectors($, verbose);
	candidates.push(...cssPrices);

	// Strategy 6: Heuristic fallback - all prices in reasonable range
	const heuristicPrices = extractByHeuristic($, verbose);
	candidates.push(...heuristicPrices);

	if (candidates.length === 0) {
		return null;
	}

	// Sort by score (highest first) and pick the best candidate
	candidates.sort((a, b) => b.score - a.score);

	if (verbose) {
		console.log(`    Found ${candidates.length} price candidates:`);
		candidates.slice(0, 5).forEach((c, i) => {
			console.log(
				`      ${i + 1}. $${c.amount} (score: ${c.score}, source: ${c.source})`
			);
		});
	}

	const best = candidates[0];
	const confidence = getConfidence(best.score);

	return {
		amount: best.amount,
		currency: 'CAD',
		confidence,
		source: best.source,
	};
}

function getConfidence(score: number): 'high' | 'medium' | 'low' {
	if (score >= 80) return 'high';
	if (score >= 50) return 'medium';
	return 'low';
}

function isValidPrice(amount: number): boolean {
	return amount >= PRICE_RANGE.min && amount <= PRICE_RANGE.max;
}

function extractPricesFromText(text: string): number[] {
	const prices: number[] = [];
	const matches = text.matchAll(PRICE_PATTERN);

	for (const match of matches) {
		const amount = parseFloat(match[1]);
		if (!isNaN(amount)) {
			prices.push(amount);
		}
	}

	return prices;
}

// Check if context suggests a discounted/non-adult price
function hasExclusionKeyword(context: string): boolean {
	const lowerContext = context.toLowerCase();
	return EXCLUSION_KEYWORDS.some((kw) => lowerContext.includes(kw.toLowerCase()));
}

// Penalty applied to prices found near exclusion keywords
const EXCLUSION_PENALTY = 50;

// ============================================================================
// Strategy 1: JSON-LD Structured Data
// ============================================================================

function extractFromJsonLd(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];

	$('script[type="application/ld+json"]').each((_, el) => {
		try {
			const content = $(el).html();
			if (!content) return;

			const data = JSON.parse(content);
			const prices = findPricesInObject(data);

			for (const price of prices) {
				if (isValidPrice(price)) {
					candidates.push({
						amount: price,
						context: 'JSON-LD structured data',
						source: 'json-ld',
						score: 90, // High confidence for structured data
					});
				}
			}
		} catch {
			// Invalid JSON, skip
		}
	});

	if (verbose && candidates.length > 0) {
		console.log(`    Strategy 1 (JSON-LD): Found ${candidates.length} prices`);
	}

	return candidates;
}

function findPricesInObject(obj: unknown): number[] {
	const prices: number[] = [];

	if (typeof obj === 'number' && isValidPrice(obj)) {
		prices.push(obj);
	} else if (typeof obj === 'string') {
		prices.push(...extractPricesFromText(obj));
	} else if (Array.isArray(obj)) {
		for (const item of obj) {
			prices.push(...findPricesInObject(item));
		}
	} else if (obj && typeof obj === 'object') {
		for (const value of Object.values(obj)) {
			prices.push(...findPricesInObject(value));
		}
	}

	return prices.filter(isValidPrice);
}

// ============================================================================
// Strategy 2: Individual Text Elements
// ============================================================================

function extractFromTextElements(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];
	const seen = new Set<string>(); // Avoid duplicates

	// Look at text elements individually to avoid concatenation issues
	$('h1, h2, h3, h4, h5, h6, p, span, li, td, th, div').each((_, el) => {
		const $el = $(el);

		// Get direct text content (not including children to avoid duplication)
		// Use a more selective approach - only elements with short, price-like content
		const text = $el.clone().children().remove().end().text().trim();
		if (!text || text.length > 100) return;

		// Also get full text for context
		const fullText = $el.text().trim();
		if (!fullText || fullText.length > 150) return;

		// Check if this element contains a price
		const prices = extractPricesFromText(fullText);
		if (prices.length === 0) return;

		// Check for keywords and exclusions
		const lowerText = fullText.toLowerCase();
		const hasKeyword = PRICE_KEYWORDS.some((kw) => lowerText.includes(kw));
		const isExcluded = hasExclusionKeyword(lowerText);

		for (const price of prices) {
			if (!isValidPrice(price)) continue;

			// Create unique key to avoid duplicates
			const key = `${price}-${lowerText.slice(0, 30)}`;
			if (seen.has(key)) continue;
			seen.add(key);

			// Calculate score based on context
			let score = 60; // Base score for element-based extraction

			// Boost for specific keywords
			if (lowerText.includes('adult')) score += 25;
			else if (hasKeyword) score += 15;

			// Big penalty for exclusion keywords
			if (isExcluded) score -= EXCLUSION_PENALTY;

			candidates.push({
				amount: price,
				context: `Element text: "${fullText.slice(0, 50)}"`,
				source: 'text-element',
				score,
			});
		}
	});

	if (verbose && candidates.length > 0) {
		console.log(
			`    Strategy 2 (Elements): Found ${candidates.length} prices`
		);
	}

	return candidates;
}

// ============================================================================
// Strategy 3: Keyword Proximity Search
// ============================================================================

function extractByKeywordProximity(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];
	const bodyText = $('body').text();

	// Create regex patterns for each keyword
	for (const keyword of PRICE_KEYWORDS) {
		// Look for keyword within 100 characters of a price
		const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const patterns = [
			// keyword ... $XX
			new RegExp(escapedKeyword + '[^$]{0,100}\\$\\s*(\\d+(?:\\.\\d{2})?)', 'gi'),
			// $XX ... keyword
			new RegExp('\\$\\s*(\\d+(?:\\.\\d{2})?)[^$]{0,100}' + escapedKeyword, 'gi'),
		];

		for (const pattern of patterns) {
			const matches = bodyText.matchAll(pattern);
			for (const match of matches) {
				const amount = parseFloat(match[1]);
				if (!isNaN(amount) && isValidPrice(amount)) {
					// Higher score for more specific keywords
					let baseScore = keyword.includes('day') || keyword.includes('drop')
						? 85
						: 70;

					// Penalize if context contains exclusion keywords (youth, student, etc.)
					const matchContext = match[0];
					if (hasExclusionKeyword(matchContext)) {
						baseScore -= EXCLUSION_PENALTY;
					}

					candidates.push({
						amount,
						context: `Near "${keyword}"`,
						source: `keyword-proximity:${keyword}`,
						score: baseScore,
					});
				}
			}
		}
	}

	if (verbose && candidates.length > 0) {
		console.log(
			`    Strategy 3 (Keywords): Found ${candidates.length} prices`
		);
	}

	return candidates;
}

// ============================================================================
// Strategy 3: Table/List Extraction
// ============================================================================

function extractFromTables(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];

	// Look for tables with pricing
	$('table tr, .pricing-row, [class*="pricing"] li, [class*="price"] li').each(
		(_, el) => {
			const rowText = $(el).text().toLowerCase();

			// Check if row contains a day pass keyword
			const hasKeyword = PRICE_KEYWORDS.some((kw) => rowText.includes(kw));
			if (!hasKeyword) return;

			// Check if row contains exclusion keywords (youth, student, etc.)
			const isExcluded = hasExclusionKeyword(rowText);

			// Extract prices from this row
			const prices = extractPricesFromText($(el).text());
			for (const price of prices) {
				if (isValidPrice(price)) {
					const score = isExcluded ? 80 - EXCLUSION_PENALTY : 80;
					candidates.push({
						amount: price,
						context: 'Table/list row with keyword',
						source: 'table-row',
						score,
					});
				}
			}
		}
	);

	if (verbose && candidates.length > 0) {
		console.log(`    Strategy 4 (Tables): Found ${candidates.length} prices`);
	}

	return candidates;
}

// ============================================================================
// Strategy 4: CSS Selector Patterns
// ============================================================================

function extractByCssSelectors(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];

	for (const selector of PRICE_SELECTORS) {
		try {
			$(selector).each((_, el) => {
				const text = $(el).text();
				const prices = extractPricesFromText(text);

				// Check surrounding context for keywords
				const parent = $(el).parent();
				const context = parent.text().toLowerCase();
				const hasKeyword = PRICE_KEYWORDS.some((kw) => context.includes(kw));
				const isExcluded = hasExclusionKeyword(context);

				for (const price of prices) {
					if (isValidPrice(price)) {
						let score = hasKeyword ? 75 : 55;
						if (isExcluded) {
							score -= EXCLUSION_PENALTY;
						}
						candidates.push({
							amount: price,
							context: `CSS selector: ${selector}`,
							source: `css:${selector}`,
							score,
						});
					}
				}
			});
		} catch {
			// Invalid selector, skip
		}
	}

	if (verbose && candidates.length > 0) {
		console.log(`    Strategy 5 (CSS): Found ${candidates.length} prices`);
	}

	return candidates;
}

// ============================================================================
// Strategy 5: Heuristic Fallback
// ============================================================================

function extractByHeuristic(
	$: CheerioAPI,
	verbose: boolean
): PriceCandidate[] {
	const candidates: PriceCandidate[] = [];
	const bodyText = $('body').text();
	const allPrices = extractPricesFromText(bodyText);

	// Filter to prices in reasonable range
	const validPrices = allPrices.filter(isValidPrice);

	// Count occurrences of each price
	const priceCount = new Map<number, number>();
	for (const price of validPrices) {
		priceCount.set(price, (priceCount.get(price) || 0) + 1);
	}

	// Add candidates with low confidence
	for (const [price, count] of priceCount) {
		candidates.push({
			amount: price,
			context: `Heuristic (appeared ${count} times)`,
			source: 'heuristic',
			score: Math.min(40 + count * 5, 49), // Max 49 to stay "low" confidence
		});
	}

	if (verbose && candidates.length > 0) {
		console.log(
			`    Strategy 6 (Heuristic): Found ${candidates.length} unique prices`
		);
	}

	return candidates;
}
