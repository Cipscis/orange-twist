import * as z from 'zod/mini';

export const legacyStatusNameSchema = z.union([
	z.literal('todo'),
	z.literal('in-progress'),
	z.literal('completed'),
	z.literal('investigating'),
	z.literal('in-review'),
	z.literal('ready-to-test'),
	z.literal('paused'),
	z.literal('approved-to-deploy'),
	z.literal('will-not-do'),
]);

export type LegacyStatusName = z.infer<typeof legacyStatusNameSchema>;
