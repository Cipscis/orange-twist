import { h, render } from 'preact';

import { OrangeTwist } from './components/OrangeTwist.js';
import { DayList } from './components/DaysList.js';
import { UnfinishedTasksList } from './components/UnfinishedTaskList.js';
import { CompletedTasksList } from './components/CompletedTasksList.js';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<DayList />

	<UnfinishedTasksList />

	<CompletedTasksList />
</OrangeTwist>, main);
