import { z } from 'zod';

import type { Post } from './post';
import { ProfileSchema } from './profile';

export const JoinRequestSchema = z.object({
	join_request_id: z.string().uuid(),
	post_id: z.string().uuid(), // Required, references post(post_id)
	request_profile_id: z.string().uuid().nullable(), // Nullable for guests
	guest_name: z.string().max(50).nullable(), // Nullable for non-guests
	guest_email: z.string().email().max(255).nullable(), // Nullable for non-guests
	date: z.coerce.date(), // e.g., '2025-04-21'
	start_time: z
		.string()
		.regex(/^\d{2}:\d{2}:\d{2}$/, 'Must be in HH:MM:SS format'), // e.g., '11:00:00'
	end_time: z
		.string()
		.regex(/^\d{2}:\d{2}:\d{2}$/, 'Must be in HH:MM:SS format'), // e.g., '15:00:00'
	message: z.string().optional(), // TEXT, nullable in DB
	status: z.enum(['pending', 'accepted', 'declined']).default('pending'), // Constrained to valid statuses
	created_at: z.string(),
	profile: ProfileSchema.pick({ username: true, email: true })
		.nullable()
		.optional(),
});

export type JoinRequest = z.infer<typeof JoinRequestSchema>;

export type JoinRequestWithPost = JoinRequest & { post: Post };
