import { z } from 'zod';

import { isZodSchemaType } from 'utils';

const templateInfoSchema = z.object({
	name: z.string(),
	template: z.string(),
});

export type TemplateInfo = z.infer<typeof templateInfoSchema>;

export const isTemplateInfo = isZodSchemaType(templateInfoSchema);
