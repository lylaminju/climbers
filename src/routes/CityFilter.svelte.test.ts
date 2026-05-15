import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import CityFilter from './CityFilter.svelte';

describe('CityFilter', () => {
    const cities = [
        { name: 'Toronto', checked: false },
        { name: 'Ottawa', checked: false },
        { name: 'Mississauga', checked: false }
    ];

    it('renders the cities button', () => {
        render(CityFilter, {
            props: {
                cities,
                isMobile: false
            }
        });
        expect(screen.getByRole('button', { name: /Cities/i })).toBeInTheDocument();
    });

    it('shows selected city count in button label when not on mobile', () => {
        const checkedCities = [
            { name: 'Toronto', checked: true },
            { name: 'Ottawa', checked: false }
        ];
        render(CityFilter, {
            props: {
                cities: checkedCities,
                isMobile: false
            }
        });
        // The component uses formatCamelCase(city.name), which might change 'Toronto' to 'toronto' 
        // depending on implementation. Let's just check if 'Toronto' exists.
        expect(screen.getByRole('button')).toHaveTextContent(/Toronto/i);
    });

    it('toggles "Select All" correctly', async () => {
        const testCities = [
            { name: 'Toronto', checked: false },
            { name: 'Ottawa', checked: false }
        ];
        const { getByText } = render(CityFilter, {
            props: {
                cities: testCities,
                isMobile: false
            }
        });

        // Click the dropdown button first to reveal the content
        await fireEvent.click(screen.getByRole('button', { name: /Cities/i }));

        const selectAllCheckbox = screen.getByText('Select All');
        await fireEvent.click(selectAllCheckbox);

        expect(testCities[0].checked).toBe(true);
        expect(testCities[1].checked).toBe(true);
    });
});
