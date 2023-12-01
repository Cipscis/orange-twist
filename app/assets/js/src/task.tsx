import { h, render } from 'preact';

import { OrangeTwist } from './components/OrangeTwist';
import { TaskDetail } from './components/TaskDetail';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

const queryParams = new URLSearchParams(document.location.search);
const taskIdParam = queryParams.get('id');
const taskId = taskIdParam === null ? null : Number(taskIdParam);

render(<OrangeTwist>
	{taskId === null
		? (
			// TODO: Show nicer error message
			<h1>This task doesn't exist</h1>
		)
		: (
			<TaskDetail
				taskId={taskId}
			/>
		)
	}
</OrangeTwist>, main);
