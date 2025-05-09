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
				gym(name, city, map_url, image_url),
				join_request(
					*,
					profile(username, email)
				)
				`,
			)
			.eq('post_id', (params as { post_id: string }).post_id)
			.order('start_time', {
				referencedTable: 'join_request',
				ascending: true,
			})
			.limit(1)
			.single();

		if (error) {
			throw error;
		}

		return { post: PostSchema.parse(data) };
	} catch (error) {
		console.error('Error loading post:', error);
		return { post: null };
	}
};

export const prerender = 'auto';
