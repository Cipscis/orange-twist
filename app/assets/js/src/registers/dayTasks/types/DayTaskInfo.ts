import { z } from 'zod';
import { isZodSchemaType } from 'util/index';

import { TaskStatus } from 'types/TaskStatus';

const dayTaskSchema = z.object({
	status: z.nativeEnum(TaskStatus),
	note: z.string(),
});

export type DayTaskInfo = z.infer<typeof dayTaskSchema>;
export const isDayTaskInfo = isZodSchemaType(dayTaskSchema);
