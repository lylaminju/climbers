import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';
import Page from '../src/routes/+page.svelte';

describe('Explore gyms', () => {
	test('should render h1', () => {
		render(Page);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
	test.todo('render climbing gyms info cards');
});

describe('Climbing meetups', () => {
	test.todo('render meetup posts');
	test.todo('render [Write a post] button');
});

describe('Meetup Post', () => {
	test.todo('render a post');
	test.todo('render [Request to Join] button');

	test.todo('request to join');
});

describe('Notifications', () => {
	test.todo('render notifications');

	test.todo('accept or decline request');
});

describe('Profile', () => {
	test.todo('render Profile info');
	test.todo('render My posts');
	test.todo('render My requests');

	test.todo('edit profile');
	test.todo('delete profile');
});
