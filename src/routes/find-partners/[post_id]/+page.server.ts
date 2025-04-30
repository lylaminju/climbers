import { PostSchema } from '$lib/schemas/post';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const { data, error } = await supabase
			.from('post')
			.select(
				`*,
				profile(username, email),
				gym(name, city),
				user_availability(date, start_time, end_time),
				join_request(*)
				`,
			)
			.eq('post_id', (params as { post_id: string }).post_id)
			.single();
		if (error) {
			throw new Error('Failed to load post.');
		}

		return { post: PostSchema.parse(data) };
	} catch (error) {
		console.error('Error loading post:', error);
		return { post: null };
	}
};

export const prerender = 'auto';
