import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

import { dayInfoSchema } from 'data/days/types/DayInfo';
import { taskInfoSchema } from 'data/tasks/types/TaskInfo';
import { dayTaskInfoSchema } from 'data/dayTasks/types/DayTaskInfo';
import { templateInfoSchema } from 'data/templates/types/TemplateInfo';
import { exportDataLikeSchema } from './ExportDataLike';

/**
 * Strict export data format used when constructing export data.
 */
export const exportDataSchema = z.extend(
	exportDataLikeSchema,
	{
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
			z.readonly(z.tuple([
				z.string(),
				z.url(), // <- Should be a data URL
			])),
		),
	},
);
export type ExportData = z.infer<typeof exportDataSchema>;
export const isExportData = isZodSchemaType(exportDataSchema);

