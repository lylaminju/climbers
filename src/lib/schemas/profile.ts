import { z } from 'zod';

export const ProfileSchema = z.object({
	profile_id: z.string().uuid().optional(),
	username: z.string().min(1).max(50),
	gym_id: z.string().uuid().nullable().optional(),
	bouldering_grade: z.string().max(10).nullable().optional(),
	sport_climbing_grade: z.string().max(10).nullable().optional(),
	whatsapp_link: z.string().url().nullable().optional(),
	instagram_link: z.string().url().nullable().optional(),
	x_link: z.string().url().nullable().optional(),
	contact_links: z.string().url().nullable().optional(),
	public_profile: z.boolean().default(false),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	deleted_at: z.coerce.date().nullable().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
