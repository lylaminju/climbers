import { z } from 'zod';

import { ClimbingGymSchema } from '$lib/types/types';
import { AvailabilityTimeSchema } from './availability';
import { ProfileSchema } from './profile';

export const PostSchema = z.object({
	post_id: z.string().uuid().optional(), // UUID, optional for creation
	user_id: z.string().uuid(),
	gym_id: z.string().uuid(),
	content: z.string().min(1),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	deleted_at: z.coerce.date().optional().nullable(),
	profile: ProfileSchema.pick({ username: true, email: true }).nullable().optional(),
	gym: ClimbingGymSchema.pick({ name: true, city: true }).nullable().optional(),
	user_availability: AvailabilityTimeSchema.array().nullable().optional(),
});

export type Post = z.infer<typeof PostSchema>;
