import { h, render } from 'preact';

import { OrangeTwist } from 'components/OrangeTwist';
import { DayList } from 'components/days/DaysList';
import { UnfinishedTaskList } from 'components/tasks/UnfinishedTaskList';
import { CompletedTaskList } from 'components/tasks/CompletedTaskList';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<DayList />

	<UnfinishedTaskList />

	<CompletedTaskList />
</OrangeTwist>, main);
