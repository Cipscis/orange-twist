import { z } from 'zod';

import { isZodSchemaType } from 'utils';

import { dayInfoSchema } from 'data/days/types/DayInfo';
import { taskInfoSchema } from 'data/tasks/types/TaskInfo';
import { dayTaskInfoSchema } from 'data/dayTasks/types/DayTaskInfo';
import { templateInfoSchema } from 'data/templates/types/TemplateInfo';
import { exportDataLikeSchema } from './ExportDataLike';

/**
 * Strict export data format used when constructing export data.
 */
export const exportDataSchema = exportDataLikeSchema.extend({
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
	templates: z.array(
		z.tuple([
			z.number(),
			templateInfoSchema,
		]),
	),
	images: z.array(
		z.tuple([
			z.string(),
			z.string().url(), // <- Should be a data URL
		]).readonly(),
	),
});
export type ExportData = z.infer<typeof exportDataSchema>;
export const isExportData = isZodSchemaType(exportDataSchema);

