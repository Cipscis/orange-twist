import { TaskStatus } from '../types/TaskStatus.js';
import { assertAllUnionMembersHandled } from '../util/index.js';

export function renderTaskStatus(taskStatus: TaskStatus): string {
	if (taskStatus === TaskStatus.TODO) {
		return '<span class="task__status" title="TODO">☐</span>';
	} else if (taskStatus === TaskStatus.IN_PROGRESS) {
		return '<span class="task__status" title="In progress">▶</span>';
	} else if (taskStatus == TaskStatus.COMPLETED) {
		return '<span class="task__status" title="Completed">☑</span>';
	} else {
		assertAllUnionMembersHandled(taskStatus);
	}
}
