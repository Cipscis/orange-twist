import { h, render } from 'preact';

import { OrangeTwist } from 'components/OrangeTwist';
import { TaskDetail } from 'components/tasks/TaskDetail';
import { Notice } from 'components/shared/Notice';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

const queryParams = new URLSearchParams(document.location.search);
const taskIdParam = queryParams.get('id');
const taskId = taskIdParam === null ? null : Number(taskIdParam);

render(<OrangeTwist backButton>
	{taskId === null || isNaN(taskId)
		? (
			<Notice
				message="A valid task ID is required"
			/>
		)
		: (
			<TaskDetail
				taskId={taskId}
			/>
		)
	}
</OrangeTwist>, main);
