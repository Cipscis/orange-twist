import { getTaskInfo } from '../getTaskInfo';
import { setTaskInfo } from '../setTaskInfo';
import type { TaskInfo } from '../types';

/**
 * Ensures all parent/child relationships are maintained
 * after a task's info is update.
 */
export function updateRelationships(
	newTaskInfo: Readonly<TaskInfo>,
	existingTaskInfo: Readonly<TaskInfo> | null
): void {
	const taskId = newTaskInfo.id;

	if (existingTaskInfo) {
		for (const oldChild of existingTaskInfo.children) {
			if (!newTaskInfo.children.includes(oldChild)) {
				// If old children have been removed from
				// this task, set their parent to null
				setTaskInfo(oldChild, { parent: null });
			}
		}

		if (
			existingTaskInfo.parent !== newTaskInfo.parent &&
			existingTaskInfo.parent !== null
		) {
			// If the parent changed, remove this task
			// from its old parent's list of children
			const parentInfo = getTaskInfo(existingTaskInfo.parent);
			if (parentInfo) {
				const parentChildrenIndex = parentInfo.children.indexOf(taskId);
				if (parentChildrenIndex !== -1) {
					setTaskInfo(existingTaskInfo.parent, {
						children: parentInfo.children.toSpliced(parentChildrenIndex, 1),
					});
				}
			}
		}
	}

	if (newTaskInfo.parent !== null) {
		// Ensure new parent has this task in its list of children
		const parentInfo = getTaskInfo(newTaskInfo.parent);
		if (!parentInfo) {
			throw new Error(`Unable to set parent, no task with id ${newTaskInfo.parent} exists`);
		}

		const parentChildren = parentInfo.children;
		if (!parentChildren.includes(taskId)) {
			setTaskInfo(newTaskInfo.parent, {
				// Add new children to the top of the list
				children: [taskId, ...parentChildren],
			});
		}
	}

	for (const child of newTaskInfo.children) {
		const childInfo = getTaskInfo(child);
		if (childInfo?.parent !== taskId) {
			// Ensure each current child has this task set as its parent
			setTaskInfo(child, { parent: taskId });
		}
	}
}
