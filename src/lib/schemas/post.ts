import { z } from 'zod';

import { ClimbingGymSchema } from '$lib/types/types';
import { JoinRequestSchema } from './joinRequest';
import { ProfileSchema } from './profile';

export const PostSchema = z
	.object({
		post_id: z.string().uuid(),
		profile_id: z.string().uuid(),
		gym_id: z.string().uuid(),
		content: z.string().min(1),
		created_at: z.coerce.date().optional(),
		updated_at: z.coerce.date().optional(),
		deleted_at: z.coerce.date().optional().nullable(),
		profile: ProfileSchema.pick({ username: true, email: true }),
		gym: ClimbingGymSchema.pick({
			name: true,
			city: true,
			map_url: true,
			image_url: true,
		}),
		start_datetime: z.string(),
		// .regex(
		// 	/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}([+-][0-9]{2})?:?([0-9]{2})?$/,
		// 	'Invalid start_datetime format (YYYY-MM-DD HH:MM:SS+ZZ:ZZ or YYYY-MM-DD HH:MM:SS-ZZ:ZZ)',
		// )
		end_datetime: z.string(),
		// .regex(
		// 	/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}([+-][0-9]{2})?:?([0-9]{2})?$/,
		// 	'Invalid end_datetime format (YYYY-MM-DD HH:MM:SS+ZZ:ZZ or YYYY-MM-DD HH:MM:SS-ZZ:ZZ)',
		// )
		join_request: JoinRequestSchema.array().nullable().optional(),
	})
	.refine(
		(data) => new Date(data.end_datetime) > new Date(data.start_datetime),
		{
			message: 'end_datetime must be after start_datetime',
			path: ['end_datetime'],
		},
	);

export type Post = z.infer<typeof PostSchema>;
