import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

/**
 * Unstrict export data used when importing data, which may be
 * in an old form. Any validation or updating will be done when
 * it is loaded.
 */
export const exportDataLikeSchema = z.object({
	days: z.unknown(),
	tasks: z.unknown(),
	dayTasks: z.unknown(),
	templates: z.optional(z.unknown()),
	images: z.optional(z.unknown()),
});
export type ExportDataLike = z.infer<typeof exportDataLikeSchema>;
export const isExportDataLike = isZodSchemaType(exportDataLikeSchema);
