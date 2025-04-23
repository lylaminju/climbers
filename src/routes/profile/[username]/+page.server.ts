import { ProfileSchema } from '$lib/schemas/profile';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('profile')
			.select('*, gym(name, city)')
			.eq('username', (params as { username: string }).username)
			.single();

		if (error) {
			throw new Error('Failed to load user profile.');
		}

		return { profile: ProfileSchema.parse(data) };
	} catch (error) {
		console.error('Error loading profile:', error);
		return { profile: null };
	}
};
