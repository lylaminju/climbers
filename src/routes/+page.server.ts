import staticGymsData from '$lib/data/climbing-gyms.json';
import { supabase } from '$lib/supabaseClient';
import type { ClimbingGym } from '$lib/types/types';

export async function load() {
	try {
		const { data, error } = await supabase.from('gym').select('*');

		if (error || !data) {
			throw error;
		}

		const formattedGyms: ClimbingGym[] = data.map((gym) => ({
			id: gym.gym_id,
			name: gym.name,
			city: gym.city,
			address: gym.address,
			mapUrl: gym.map_url,
			placeId: gym.place_id,
			coordinates: {
				latitude: gym.latitude,
				longitude: gym.longitude
			},
			publicTransport: {
				subway: gym.subway_station
					? {
							line: gym.subway_line,
							station: gym.subway_station
						}
					: undefined,
				busOrTram: Boolean(gym.bus_tram)
			},
			websiteUrl: gym.website_url ?? undefined,
			price: {
				currency: gym.price_currency,
				amount: gym.price_amount,
				tax: gym.price_tax ?? undefined,
				sourceUrl: gym.price_source_url ?? undefined
			},
			iconUrl: `gym-icon/${gym.icon_url}`,
			imageUrl: `gym-preview/${gym.image_url}`,
			area: {
				unit: gym.area_unit,
				value: gym.area_value
			},
			climbingTypes: {
				boulder: gym.boulder,
				autoBelay: gym.auto_belay,
				topRope: gym.top_rope,
				lead: gym.lead
			},
			boards: {
				moonBoard: gym.moon_board,
				kilterBoard: gym.kilter_board,
				tensionBoard: gym.tension_board
			}
		}));

		return { gyms: formattedGyms };
	} catch (error) {
		console.error('Error loading gyms from database:', error);
		const formattedGyms = staticGymsData.gyms.map((gym) => ({
			...gym,
			iconUrl: `gym-icon/${gym.iconUrl}`,
			imageUrl: `gym-preview/${gym.imageUrl}`
		}));

		return { gyms: formattedGyms };
	}
}
