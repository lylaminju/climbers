import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('post')
			.select(
				`*,
				gym(name),
				profile!inner(username)
			`,
			)
			.eq('profile.username', params.username)
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(error.message);
		}

		return { posts: data };
	} catch (error) {
		console.error(`Failed to load posts\n${error}`);
		return { posts: null };
	}
};

export const prerender = 'auto';
