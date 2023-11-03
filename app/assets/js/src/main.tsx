import { h, render } from 'preact';

import { OrangeTwist } from './components/OrangeTwist';
import { DayList } from './components/DaysList';
import { UnfinishedTasksList } from './components/UnfinishedTaskList';
import { CompletedTasksList } from './components/CompletedTasksList';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<DayList />

	<UnfinishedTasksList />

	<CompletedTasksList />
</OrangeTwist>, main);
