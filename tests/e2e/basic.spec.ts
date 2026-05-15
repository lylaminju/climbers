import { expect, test, type Page } from '@playwright/test';

const gymCards = (page: Page) => page.locator('[id^="gym-card-"]');
const gymTitles = (page: Page) => page.locator('#gyms .gym-title h2');
const gymCities = (page: Page) => page.locator('#gyms .gym-title p');

async function visibleText(locator: ReturnType<Page['locator']>) {
	return (await locator.allTextContents())
		.map((text) => text.trim())
		.filter(Boolean);
}

async function openDropdown(
	page: Page,
	buttonName: string,
	expectedOption: ReturnType<Page['locator']>
) {
	const button = page.getByRole('button', { name: buttonName });
	await expect(button).toBeVisible();

	for (let attempt = 0; attempt < 3; attempt += 1) {
		if (await expectedOption.isVisible()) return;

		await button.click();
		try {
			await expect(expectedOption).toBeVisible({ timeout: 1000 });
			return;
		} catch {
			// Flowbite attaches dropdown triggers during hydration; retry the user click.
		}
	}

	await expect(expectedOption).toBeVisible();
}

test.describe('ClimberzDay Core Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(gymCards(page).first()).toBeVisible();
	});

	test('should load landing page and display gyms', async ({ page }) => {
		await expect(
			page.getByRole('heading', { name: 'ClimberzDay' })
		).toBeVisible();
		await expect(gymCards(page).first()).toBeVisible();
		await expect(gymTitles(page).first()).not.toBeEmpty();
	});

	test('should filter gyms by city', async ({ page }) => {
		await openDropdown(
			page,
			'Cities',
			page.getByRole('checkbox', { name: 'Select All' })
		);

		const cityNames = (
			await visibleText(page.locator('[role="tooltip"] label'))
		).filter((name) => name !== 'Select All' && name !== 'Clear');
		expect(cityNames.length).toBeGreaterThan(0);

		const selectedCity = cityNames[0];
		await page.getByRole('checkbox', { name: selectedCity }).check();

		await expect(
			page.getByRole('checkbox', { name: selectedCity })
		).toBeChecked();
		await expect
			.poll(async () => {
				const cities = await visibleText(gymCities(page));
				return (
					cities.length > 0 &&
					cities.every(
						(city) => city.toLowerCase() === selectedCity.toLowerCase()
					)
				);
			})
			.toBe(true);
	});

	test('should sort gyms by name', async ({ page }) => {
		await openDropdown(
			page,
			'Sorting options',
			page.getByRole('button', { name: 'Name: A to Z' })
		);
		await page.getByRole('button', { name: 'Name: A to Z' }).click();

		await expect(
			page.getByRole('button', { name: 'Sorting options' })
		).toContainText('Name: A to Z');

		const titles = await visibleText(gymTitles(page));
		expect(titles.length).toBeGreaterThan(0);
		expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
	});
});
