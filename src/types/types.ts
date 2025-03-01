import { z } from 'zod';

export const PublicTransportSchema = z.object({
	subway: z
		.object({
			line: z.string(),
			station: z.string(),
		})
		.optional(), // within 1.5km
	busOrTram: z.boolean().optional(),
});

export const priceSchema = z.object({
	currency: z.string(),
	amount: z.number(),
	tax: z.string().optional(),
	sourceUrl: z.string().url().optional(),
});

export const areaSchema = z.object({
	unit: z.string(),
	value: z.number(),
});

export const climbingTypeSchema = z.object({
	boulder: z.boolean(),
	topRope: z.boolean(),
	lead: z.boolean(),
	autoBelay: z.boolean(),
});

export type GymFeature = z.infer<typeof climbingTypeSchema>;

export const GymBoardSchema = z.object({
	moonBoard: z.boolean(),
	kilterBoard: z.boolean(),
});

export type GymBoard = z.infer<typeof GymBoardSchema>;

export const ClimbingGymSchema = z.object({
	name: z.string(),
	city: z.string(),
	address: z.string(),
	mapUrl: z.string().url({ message: 'Invalid map URL' }),
	publicTransport: PublicTransportSchema.optional(),
	price: priceSchema,
	iconUrl: z.string(),
	imageUrl: z.string().optional(),
	websiteUrl: z.string().url({ message: 'Invalid website URL' }).optional(),
	area: areaSchema,
	climbingTypes: climbingTypeSchema,
	boards: GymBoardSchema,
});

export type ClimbingGym = z.infer<typeof ClimbingGymSchema>;
