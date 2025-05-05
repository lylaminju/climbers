import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('post')
			.select(
				`*,
				gym(name),
				user_availability(date, start_time, end_time),
				profile(username)
			`,
			)
			.eq('profile.username', params.username)
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(JSON.stringify(error, null, 2));
		}

		return { posts: data };
	} catch (error) {
		console.error(`Failed to load posts\n${error}`);
		return { posts: null };
	}
};

export const prerender = 'auto';
