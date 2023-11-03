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
	<TaskDetail
		taskId={taskId}
	/>
</OrangeTwist>, main);
