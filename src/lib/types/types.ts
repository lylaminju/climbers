import { z } from 'zod';

export const CoordinatesSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const PublicTransportSchema = z.object({
	subway: z
		.object({
			line: z.string(),
			station: z.string(),
		})
		.optional(), // within 1.5km
	busOrTram: z.boolean().optional(),
});

export const PriceSchema = z.object({
	currency: z.string(),
	amount: z.number(),
	tax: z.string().optional(),
	sourceUrl: z.string().url().optional(),
});

// climbing surface
export const AreaSchema = z.object({
	unit: z.string(),
	value: z.number(),
});

export const ClimbingTypeSchema = z.object({
	boulder: z.boolean(),
	autoBelay: z.boolean(),
	topRope: z.boolean(),
	lead: z.boolean(),
});
export type ClimbingType = z.infer<typeof ClimbingTypeSchema>;

export const GymBoardSchema = z.object({
	moonBoard: z.boolean(),
	kilterBoard: z.boolean(),
});
export type GymBoard = z.infer<typeof GymBoardSchema>;

export const ClimbingGymSchema = z.object({
	id: z.number(),
	name: z.string(),
	city: z.string(),
	address: z.string(),
	mapUrl: z.string().url({ message: 'Invalid map URL' }),
	placeId: z.string(),
	coordinates: CoordinatesSchema,
	publicTransport: PublicTransportSchema.optional(),
	price: PriceSchema,
	iconUrl: z.string(),
	imageUrl: z.string().optional(),
	websiteUrl: z.string().url({ message: 'Invalid website URL' }).optional(),
	area: AreaSchema,
	climbingTypes: ClimbingTypeSchema,
	boards: GymBoardSchema,
});
export type ClimbingGym = z.infer<typeof ClimbingGymSchema>;
