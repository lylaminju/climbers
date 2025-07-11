import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('join_request')
			.select(
				`*,
				post!inner(
					*,
					gym(name),
					profile(username)
				),
				profile!inner(username)
			`
			)
			.eq('profile.username', params.username)
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(JSON.stringify(error, null, 2));
		}

		return { joinRequests: data };
	} catch (error) {
		console.error(`Failed to load join requests\n${error}`);
		return { joinRequests: null };
	}
};
