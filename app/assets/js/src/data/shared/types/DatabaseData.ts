import { isZodSchemaType } from 'utils';
import * as z from 'zod/mini';

export const databaseDataSchema = z.object({
	schemaVersion: z.literal('2.0.0'),
	day: z.array(
		z.object({
			id: z.number(),
			year: z.number(),
			month: z.number(),
			day: z.number(),
			note: z.string(),
		}),
	),
	task: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			note: z.string(),
			sortIndex: z.nullable(z.number()),
			status: z.number(),
		}),
	),
	day_task: z.array(
		z.object({
			id: z.number(),
			day: z.number(),
			task: z.number(),
			note: z.string(),
			summary: z.string(),
			sortIndex: z.nullable(z.number()),
			status: z.number(),
		}),
	),
	status: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			isComplete: z.boolean(),
		}),
	),
	template: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			template: z.string(),
			sortIndex: z.nullable(z.number()),
		}),
	),
	image: z.array(
		z.object({
			id: z.number(),
			hash: z.string(),
			file: z.instanceof(Blob),
		}),
	),
});

export type DatabaseData = z.infer<typeof databaseDataSchema>;

export const isDatabaseData = isZodSchemaType(databaseDataSchema);
