import * as z from 'zod/mini';

export const legacyDaysSchema = z.array(
	z.tuple([
		z.string(),
		z.object({
			name: z.string(),
			note: z.string(),
			tasks: z.readonly(z.array(z.number())),
		}),
	]),
);
