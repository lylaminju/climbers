import climbingGymData from '$lib/data/climbing-gyms.json';

export async function load() {
	return climbingGymData;
}

export const prerender = true;
