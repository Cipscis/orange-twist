import * as z from 'zod/mini';

import type { EnumTypeOf } from 'utils/EnumTypeOf';

export const LegacyStatusName = {
	TODO: 'todo',
	IN_PROGRESS: 'in-progress',
	COMPLETED: 'completed',
	INVESTIGATING: 'investigating',
	IN_REVIEW: 'in-review',
	READY_TO_TEST: 'ready-to-test',
	PAUSED: 'paused',
	APPROVED_TO_DEPLOY: 'approved-to-deploy',
	WILL_NOT_DO: 'will-not-do',
} as const;
export type LegacyStatusName = EnumTypeOf<typeof LegacyStatusName>;

export const legacyStatusNameSchema = z.union(
	Object.values(LegacyStatusName).map(
		(name) => z.literal(name)
	)
);
