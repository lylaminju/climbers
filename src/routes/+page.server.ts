import type { RequestEvent } from '@sveltejs/kit';
import type { ClimbingGym } from '../types/types';

export async function load(event: RequestEvent): Promise<ClimbingGym[]> {
	const response = await event.fetch('../../static/climbing-gyms.json');
	const climbingGyms = await response.json();

	return climbingGyms;
}
