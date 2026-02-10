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

### Tier 2: Playwright MCP Server (Wix/JS Sites)

For sites that load content via JavaScript (Wix, React, etc.), use the Playwright MCP tools (`browser_navigate`, `browser_snapshot`, `browser_evaluate`). It renders the full page in a headless browser, so prices are available in the DOM after JS execution.

**Batch approach:** Use `browser_run_code` to loop through multiple gym URLs in one call, extracting lines matching `$\d+`. This is efficient for simple HTML sites.

**Manual fallback:** For accordion/expandable pricing sections (common on Squarespace, WordPress), use `browser_navigate` → `browser_snapshot` → `browser_click` (to expand) → `browser_snapshot` again.

**Important:** Playwright MCP agents cannot run in parallel — they share one browser session. Always validate sequentially.

### Tier 3: Raw HTML Parsing (Fallback)

If Playwright MCP is unavailable, the data is often embedded in raw HTML even on JS-heavy sites.

Use `curl` with regex patterns:

```bash
# Search for pricing patterns
curl -s 'https://example.com/pricing' | grep -oiE '(day.?pass|drop.?in|adult)[^<>"]{0,50}\$[0-9]+(\.[0-9]{2})?' | head -10

# Get all dollar amounts for context
curl -s 'https://example.com/pricing' | grep -oiE '\$[0-9]+(\.[0-9]{2})?' | sort -u | head -15

# Get context around a specific price
curl -s 'https://example.com/pricing' | grep -oiE '.{0,50}\$27.{0,50}' | head -5
```

### Tier 4: Manual Verification

If all approaches fail (site down, heavily obfuscated), flag for manual verification.

## Supabase Database Updates

**Environments:**

- **Test**: credentials in `.env.test`
- **Prod**: credentials in `.env.prod`

Always update **both** test and prod databases when making data corrections.

### Fetching gym data

```bash
curl -s 'https://[PROJECT].supabase.co/rest/v1/gym?select=gym_id,name,price_amount,price_source_url,website_url' \
  -H 'apikey:[KEY]' \
  -H 'Authorization:Bearer [KEY]'
```

### Updating a gym record

```bash
curl -s -X PATCH 'https://[PROJECT].supabase.co/rest/v1/gym?gym_id=eq.[GYM_ID]' \
  -H 'apikey:[KEY]' \
  -H 'Authorization:Bearer [KEY]' \
  -H 'Content-Type:application/json' \
  -H 'Prefer:return=representation' \
  -d '{"price_amount": 28.00, "price_source_url": "https://example.com/pricing"}'
```

> **Note:** Use `apikey:VALUE` (no space after colon) to avoid encoding issues in some shells. Use `Prefer:return=representation` to confirm updates in the response.

## Data Extraction

- When scraping prices or data with multiple variants (adult/youth, standard/premium, etc.), always extract ALL variants and clearly label them, defaulting to adult/standard unless specified otherwise.

## Known Limitations

1. **Wix/React sites**: Content loads via JavaScript. Use Playwright MCP server, or fall back to raw HTML parsing with regex.
2. **GoDaddy Website Builder**: Pricing pages use URL-encoded paths (e.g., `/price%2Fmembership`). Popup modals often block navigation — close them first before interacting with menus.
3. **Squarespace/WordPress accordions**: Pricing is hidden in expandable sections. Must click to expand before reading prices.
4. **Playwright MCP is single-session**: Cannot parallelize across multiple subagents — they share one browser and interfere with each other's navigation.
5. **Site downtime**: Some gym websites go offline. Flag these for later verification.

## Future Improvements

1. ~~**Headless Browser MCP Server**~~: Done — Playwright MCP (`@playwright/mcp`) is configured in `.mcp.json`.

2. ~~**Full Price Validation**~~: Done — All 52 gyms validated on 2026-02-09. 48 matched, 4 price increases corrected, 1 broken URL fixed.

3. **Scheduled Price Checks**: Create a script that runs periodically to check all gym prices and flag discrepancies.

4. **Price Change Alerts**: Monitor `price_source_url` pages for changes and notify when updates are detected.
