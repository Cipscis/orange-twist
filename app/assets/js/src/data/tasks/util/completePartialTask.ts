import type { TaskInfo } from '../types';

/**
 * Combines a partial `TaskInfo` with a complete fallback
 * `TaskInfo` into an updated complete `TaskInfo`.
 */
export function completePartialTask(
	partialTask: Partial<Omit<TaskInfo, 'id'>>,
	fallback: TaskInfo
): TaskInfo {
	return {
		id: fallback.id,

		name: partialTask.name ?? fallback?.name,
		status: partialTask.status ?? fallback?.status,
		note: partialTask.note ?? fallback?.note,
		sortIndex: partialTask.sortIndex ?? fallback?.sortIndex,

		parent: typeof partialTask.parent !== 'undefined'
			? partialTask.parent
			: fallback.parent,
		children: partialTask.children ?? fallback.children,
	};
}
