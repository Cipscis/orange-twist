/**
 * Construct a relative URL to navigate to the task detail page for a given task ID.
 */
export function getTaskDetailUrl(taskId: number): string {
	return `/task/?id=${taskId}`;
}
