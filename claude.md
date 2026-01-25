# Claude Code Instructions for Climbers Project

## Coding Conventions

- Prefer async/await over nested callbacks for better readability and error handling

## Gym Price Verification Strategy

When verifying gym prices against their websites, use a tiered approach:

### Tier 1: WebFetch (Simple Sites)
For traditional HTML sites, use `WebFetch` with a prompt like:
```
Find the adult day pass price for climbing. Return just the price amount and currency.
```

### Tier 2: Raw HTML Parsing (Wix/JS Sites)
Many gym sites use Wix or similar frameworks that load content via JavaScript. WebFetch can't execute JS, but the data is often embedded in the raw HTML.

Use `curl` with regex patterns:

```bash
# Search for pricing patterns
curl -s 'https://example.com/pricing' | grep -oiE '(day.?pass|drop.?in|adult)[^<>"]{0,50}\$[0-9]+(\.[0-9]{2})?' | head -10

# Get all dollar amounts for context
curl -s 'https://example.com/pricing' | grep -oiE '\$[0-9]+(\.[0-9]{2})?' | sort -u | head -15

# Get context around a specific price
curl -s 'https://example.com/pricing' | grep -oiE '.{0,50}\$27.{0,50}' | head -5
```

### Tier 3: Manual Verification
If both approaches fail (site down, heavily obfuscated), flag for manual verification.

## Supabase Database Updates

### Fetching gym data
```bash
curl -s 'https://[PROJECT].supabase.co/rest/v1/gym?select=gym_id,name,price_amount,price_source_url,website_url' \
  -H 'apikey: [ANON_KEY]' \
  -H 'Authorization: Bearer [ANON_KEY]'
```

### Updating a gym record
```bash
curl -s -X PATCH 'https://[PROJECT].supabase.co/rest/v1/gym?gym_id=eq.[GYM_ID]' \
  -H 'apikey: [ANON_KEY]' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=minimal' \
  -d '{"price_amount": 28.00, "price_source_url": "https://example.com/pricing"}'
```

## Known Limitations

1. **Wix/React sites**: Content loads via JavaScript. Use raw HTML parsing with regex.
2. **GoDaddy website builder**: Similar to Wix, pricing may be in encoded URLs (e.g., `/price%2Fmembership`)
3. **Site downtime**: Some gym websites go offline. Flag these for later verification.

## Future Improvements

Better approaches that could be implemented:

1. **Headless Browser MCP Server**: Set up a Puppeteer or Playwright MCP server to render JavaScript and extract fully-loaded page content.

2. **Scheduled Price Checks**: Create a script that runs periodically to check all gym prices and flag discrepancies.

3. **Price Change Alerts**: Monitor `price_source_url` pages for changes and notify when updates are detected.

4. **AI-powered extraction**: Fine-tune extraction prompts or use structured data extraction APIs that can handle dynamic content.
