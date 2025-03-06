import climbingGymData from '$lib/data/climbing-gyms.json';

export async function load() {
	const updatedGyms = climbingGymData.gyms.map((gym) => ({
		...gym,
		iconUrl: `gym-icon/${gym.iconUrl}`,
		imageUrl: `gym-preview/${gym.imageUrl}`,
	}));

	return { gyms: updatedGyms };
}

export const prerender = true;
