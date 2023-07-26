import { TaskStatus } from '../types/TaskStatus.js';
import { assertAllUnionMembersHandled } from '../util/index.js';

export function renderTaskStatus(taskStatus: TaskStatus): string {
	if (taskStatus === TaskStatus.TODO) {
		return '<button type="button" class="task__status js-task__status" title="TODO">☐</button>';
	} else if (taskStatus === TaskStatus.IN_PROGRESS) {
		return '<button type="button" class="task__status js-task__status" title="In progress">▶</button>';
	} else if (taskStatus == TaskStatus.COMPLETED) {
		return '<button type="button" class="task__status js-task__status" title="Completed">☑</button>';
	} else {
		assertAllUnionMembersHandled(taskStatus);
	}
}
