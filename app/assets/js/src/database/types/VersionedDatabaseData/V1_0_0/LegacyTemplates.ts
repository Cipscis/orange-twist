import * as z from 'zod/mini';

export const legacyTemplatesSchema = z.array(
	z.tuple([
		z.number(),
		z.object({
			id: z.number(),
			name: z.string(),
			template: z.string(),
			sortIndex: z.number(),
		}),
	]),
);
