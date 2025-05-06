import { ProfileSchema } from '$lib/schemas/profile';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('profile')
			.select('*, gym(name, city)')
			.eq('username', (params as { username: string }).username)
			.is('deleted_at', null)
			.single();

		if (error) {
			throw new Error(error.message);
		}

		return { profile: ProfileSchema.parse(data) };
	} catch (error) {
		console.error(`Failed to load profile\n${error}`);
		return { profile: null };
	}
};

export const prerender = 'auto';
