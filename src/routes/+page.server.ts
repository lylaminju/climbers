import climbingGymData from '$lib/data/climbing-gyms.json';

export async function load() {
	climbingGymData.gyms.map((gym) => {
		gym.iconUrl = `gym-icon/${gym.iconUrl}`;
		gym.imageUrl = `gym-preview/${gym.imageUrl}`;
	});

	return climbingGymData;
}

export const prerender = true;
