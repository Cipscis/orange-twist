import { z } from 'zod';

import { isZodSchemaType } from 'utils';

export const templateInfoSchema = z.object({
	id: z.number(),
	name: z.string(),
	template: z.string(),
	sortIndex: z.number(),
});

export type TemplateInfo = z.infer<typeof templateInfoSchema>;

export const isTemplateInfo = isZodSchemaType(templateInfoSchema);
