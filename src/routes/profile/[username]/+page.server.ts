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

		const { data: joinRequests, error: joinRequestsError } = await supabase
			.from('join_request')
			.select(
				`*,
				post!inner(
					*,
					gym(name),
					user_availability(date, start_time, end_time),
					profile(username)
				)`,
			)
			.eq('request_profile_id', data.profile_id)
			.order('created_at', { ascending: false });

		if (joinRequestsError) {
			throw new Error('Failed to load join requests.');
		}

		return { profile: ProfileSchema.parse(data), joinRequests: joinRequests };
	} catch (error) {
		console.error('Error loading profile and join requests\n', error);
		return { profile: null, joinRequests: null };
	}
};

export const prerender = 'auto';
