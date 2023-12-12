import { z } from 'zod';

import { isZodSchemaType } from 'util/index';

import { dayInfoSchema } from 'data/days/types/DayInfo';
import { taskInfoSchema } from 'data/tasks/types/TaskInfo';
import { dayTaskInfoSchema } from 'data/dayTasks/types/DayTaskInfo';

const exportDataSchema = z.object({
	days: z.array(
		z.tuple([
			z.string(),
			dayInfoSchema,
		]),
	),
	tasks: z.array(
		z.tuple([
			z.number(),
			taskInfoSchema,
		]),
	),
	dayTasks: z.array(
		z.tuple([
			z.string(),
			dayTaskInfoSchema,
		]),
	),
});

export type ExportData = z.infer<typeof exportDataSchema>;

export const isExportData = isZodSchemaType(exportDataSchema);
