import { z } from 'zod';

import { ClimbingGymSchema } from '$lib/types/types';

export const ProfileSchema = z.object({
	profile_id: z.string().uuid().optional(),
	email: z.string().email(),
	username: z.string().min(1).max(50),
	gym_id: z.string().uuid().nullable().optional(),
	bouldering_grade: z.string().max(10).nullable().optional(),
	sport_climbing_grade: z.string().max(10).nullable().optional(),
	phone_number: z.string().nullable().optional(),
	instagram_link: z.string().url().nullable().optional(),
	x_link: z.string().url().nullable().optional(),
	contact_links: z.array(z.string().url()).nullable().optional(),
	public_profile: z.boolean().default(false),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	deleted_at: z.coerce.date().nullable().optional(),
	gym: ClimbingGymSchema.pick({ name: true, city: true }).nullable().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
