import { h, render } from 'preact';

import { TaskDetail } from './components/TaskDetail.js';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

const queryParams = new URLSearchParams(document.location.search);
const taskIdParam = queryParams.get('id');
const taskId = taskIdParam === null ? null : Number(taskIdParam);

render(<TaskDetail
	taskId={taskId}
/>, main);
