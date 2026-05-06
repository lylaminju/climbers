import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { ClimbingGym } from '$lib/types/types';
import GymCardsSection from './GymCardsSection.svelte';

function createGym(index: number): ClimbingGym {
	return {
		id: index,
		name: `Gym ${index}`,
		city: 'toronto',
		address: `${index} Test St`,
		mapUrl: `https://maps.example.com/gym-${index}`,
		placeId: `place-${index}`,
		coordinates: {
			latitude: 43 + index / 100,
			longitude: -79 - index / 100,
		},
		publicTransport: {
			busOrTram: true,
		},
		price: {
			currency: 'CAD',
			amount: 25,
			sourceUrl: `https://example.com/gym-${index}/prices`,
		},
		iconUrl: `gym-icon/gym-${index}.svg`,
		imageUrl: `gym-preview/gym-${index}.webp`,
		websiteUrl: `https://example.com/gym-${index}`,
		area: {
			unit: 'sq ft',
			value: 10000,
		},
		climbingTypes: {
			boulder: true,
			autoBelay: false,
			topRope: true,
			lead: false,
		},
		boards: {
			moonBoard: false,
			kilterBoard: true,
			tensionBoard: false,
		},
	};
}

describe('GymCardsSection', () => {
	it('uses real preview images with eager first row and lazy offscreen cards', () => {
		const gyms = Array.from({ length: 7 }, (_, index) => createGym(index + 1));

		const { container } = render(GymCardsSection, {
			props: {
				displayedGyms: gyms,
				isMobile: false,
				gymPlaceIds: [],
				toggleChildElementVisibility: vi.fn(),
				handleDestination: vi.fn(),
			},
		});

		const previewImages = container.querySelectorAll(
			'.gym-card > img[aria-hidden="true"]'
		);
		expect(previewImages).toHaveLength(7);

		previewImages.forEach((image, index) => {
			expect(image).toHaveAttribute('alt', '');
			expect(image).toHaveAttribute('decoding', 'async');
			expect(image).toHaveClass('object-cover');
			expect(image).toHaveAttribute('loading', index < 6 ? 'eager' : 'lazy');
		});

		expect(container.querySelector('.gym-card')).not.toHaveAttribute('style');
	});

	it('keeps card toggle and destination button propagation behavior separate', async () => {
		const toggleChildElementVisibility = vi.fn();
		const handleDestination = vi.fn(
			(event: MouseEvent, _gymPlaceId: string) => {
				event.stopPropagation();
			}
		);

		const { container } = render(GymCardsSection, {
			props: {
				displayedGyms: [createGym(1)],
				isMobile: true,
				gymPlaceIds: [],
				toggleChildElementVisibility,
				handleDestination,
			},
		});

		const card = container.querySelector('#gym-card-1');
		const destinationButton = container.querySelector('#add-destination-1');

		expect(card).not.toBeNull();
		expect(destinationButton).not.toBeNull();

		await fireEvent.click(card as Element);
		expect(toggleChildElementVisibility).toHaveBeenCalledWith(1);

		toggleChildElementVisibility.mockClear();
		await fireEvent.click(destinationButton as Element);

		expect(handleDestination).toHaveBeenCalledTimes(1);
		expect(handleDestination.mock.calls[0][1]).toBe('place-1');
		expect(toggleChildElementVisibility).not.toHaveBeenCalled();
	});
});
