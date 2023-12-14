import { h, render } from 'preact';

import { OrangeTwist } from '../components/OrangeTwist';
import { DayList } from '../components/DaysList';
import { UnfinishedTaskList } from '../components/UnfinishedTaskList';
import { CompletedTaskList } from '../components/CompletedTaskList';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<DayList />

	<UnfinishedTaskList />

	<CompletedTaskList />
</OrangeTwist>, main);
