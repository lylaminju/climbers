// Ontario regions to search for climbing gyms

export interface SearchRegion {
	name: string;
	latitude: number;
	longitude: number;
	radius: number; // meters (max 50000 for Places API)
}

// Four broad searches to cover Ontario
// Text search with "climbing gym" + location bias should catch most gyms
export const ONTARIO_REGIONS: SearchRegion[] = [
	{
		name: 'Southern Ontario',
		latitude: 43.65, // ~Toronto
		longitude: -79.38,
		radius: 50000,
	},
	{
		name: 'Western Ontario',
		latitude: 43.0, // ~London
		longitude: -81.25,
		radius: 50000, // Covers London, Kitchener-Waterloo, Goderich, Windsor
	},
	{
		name: 'Eastern Ontario',
		latitude: 45.42, // ~Ottawa
		longitude: -75.7,
		radius: 50000, // Covers Ottawa, Gatineau, Kingston, Belleville
	},
	{
		name: 'Northern Ontario',
		latitude: 46.49, // ~Sudbury
		longitude: -81.0,
		radius: 50000,
	},
];

export const SEARCH_QUERY = 'climbing gym Ontario';

// Known false positives - placeIds that are not climbing gyms
// These were manually verified and should be excluded from results
export const EXCLUDED_PLACE_IDS = [
	'ChIJS2aUuO_L1IkR8BST_gorVE8', // Altitude Athletic Training - altitude training facility
	'ChIJidpEJz7L1IkR95dPoBIlBGI', // Cooper Koo Family YMCA - community center
	'ChIJe6_Bf6M2K4gRKcR0l3fW8n8', // The Monkey Vault - parkour center
	'ChIJTws7NUvL1IkRswhEXvIkzdc', // Toronto Metropolitan University Recreation
	'ChIJF6C1nGvyLogRyZTu0tYZSh4', // CTC Obstacles - ninja/obstacle course
	'ChIJ__8_UxnyLogRhB0jW3DjTl8', // BGC London - community center
	'ChIJJVygnUD5LogR3YTNCHcWrls', // Stoney Creek Community Centre YMCA
	'ChIJ6-UlHqbxLogRzcE-39l39rs', // Forest City Fitness - regular gym
	'ChIJc0SI_oUFzkwRb-m9r_BQh48', // Where I Thrive - wellness studio
	'ChIJJS1VFc8AzkwRjk4NzvKsgdc', // OCR Academy - obstacle course racing
	'ChIJ15foAAoFzkwRrz5HrnxykXA', // Minto Sports Complex - university sports
	'ChIJocUcG7AFzkwRUt6bVcQNGAY', // Taggart Family YMCA - community center
	'ChIJKfw_qAMEzkwRrHMWc6BPNc8', // Kazam Gymnastics - gymnastics
	'ChIJ-2hKpbIGzkwRzYw_ba5E8yM', // Dovercourt Recreation Centre
	'ChIJI6cK33QPzkwRqPVicerN1gA', // Laws of Motion - tumbling/gymnastics
	'ChIJsRkRmigFzkwRF5XJNqacIE0', // SuyinLifts Gym - personal training
	'ChIJux5b2aL_zUwRJepN2Hoxz4U', // Kanata GymnoSphere - gymnastics
	'ChIJp1aTPYb_0UwRzsoyZLcb54Q', // Richcraft Recreation Complex - city rec center
	'ChIJfYIclcBvK4gRrzlbhUTD3lU', // Impact Climbing Inc - Climbing gym manufacturer
];
