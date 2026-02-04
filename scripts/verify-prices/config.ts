// ============================================================================
// Configuration Constants for Price Verification
// ============================================================================

// Keywords that indicate day pass pricing
export const PRICE_KEYWORDS = [
	'day pass',
	'daypass',
	'drop-in',
	'drop in',
	'dropin',
	'single visit',
	'single entry',
	'walk-in',
	'walk in',
	'walkin',
	'adult',
	'general admission',
	'daily',
	'one time',
	'one-time',
];

// Keywords that indicate discounted/non-adult prices (should be excluded)
export const EXCLUSION_KEYWORDS = [
	'under',
	'youth',
	'child',
	'children',
	'kid',
	'kids',
	'student',
	'senior',
	'junior',
	'teen',
	'minor',
	'65+',
	'55+',
	'and under',
	'or under',
	'years old',
	'yrs old',
	'y/o',
];

// Regex pattern to match prices (supports $XX, $XX.XX, $ XX, etc.)
export const PRICE_PATTERN = /\$\s*(\d+(?:\.\d{2})?)/g;

// CSS selectors commonly used for pricing
export const PRICE_SELECTORS = [
	'.price',
	'[class*="price"]',
	'[data-price]',
	'.pricing',
	'[class*="pricing"]',
	'.cost',
	'[class*="cost"]',
	'.rate',
	'[class*="rate"]',
	'.fee',
	'[class*="fee"]',
];

// Reasonable price range for day passes (CAD)
export const PRICE_RANGE = {
	min: 15,
	max: 50,
};

// Scraping timeouts and retries
export const SCRAPE_CONFIG = {
	navigationTimeout: 30000,
	waitForSelector: 5000,
	retryAttempts: 2,
	retryDelayMs: [1000, 2000], // Exponential backoff delays
};

// Bot detection indicators (phrases that suggest we've been blocked)
export const BOT_DETECTION_INDICATORS = [
	'verify you are human',
	'captcha',
	'i am not a robot',
	'access denied',
	'403 forbidden',
	'rate limit exceeded',
	'too many requests',
	'please enable javascript',
	'browser check',
];
