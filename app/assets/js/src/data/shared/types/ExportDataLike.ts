import { z } from 'zod';

import { isZodSchemaType } from 'util/index';

/**
 * Unstrict export data used when importing data, which may be
 * in an old form. Any validation or updating will be done when
 * it is loaded.
 */
export const exportDataLikeSchema = z.object({
	days: z.unknown(),
	tasks: z.unknown(),
	dayTasks: z.unknown(),
});
export type ExportDataLike = z.infer<typeof exportDataLikeSchema>;
export const isExportDataLike = isZodSchemaType(exportDataLikeSchema);
