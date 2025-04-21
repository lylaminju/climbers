import { z } from 'zod';

export const UserSchema = z.object({
	user_id: z.string().uuid().optional(),
	username: z.string().min(1).max(50),
	email: z.string().email().max(255),
	password: z.string().min(6).max(255),
	home_gym_id: z.string().uuid().nullable().optional(),
	bouldering_grade: z.string().max(10).nullable().optional(),
	sport_climbing_grade: z.string().max(10).nullable().optional(),
	whatsapp_link: z.string().url().nullable().optional(),
	instagram_link: z.string().url().nullable().optional(),
	x_link: z.string().url().nullable().optional(),
	contact_links: z.array(z.string()).nullable().optional(),
	public_profile: z.boolean().default(false),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	deleted_at: z.coerce.date().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
