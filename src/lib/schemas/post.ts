import { z } from 'zod';

export const PostSchema = z.object({
	post_id: z.string().uuid().optional(), // UUID, optional for creation
	user_id: z.string().uuid(),
	gym_id: z.string().uuid(),
	available_time: z.string().min(1),
	preferred_time: z.string().optional().nullable(),
	content: z.string().min(1),
	created_at: z.coerce.date().optional(),
	updated_at: z.coerce.date().optional(),
	deleted_at: z.coerce.date().optional().nullable(),
});

export type Post = z.infer<typeof PostSchema>;
