import { h, render } from 'preact';

import { OrangeTwist } from 'components/OrangeTwist';
import { DaysList } from 'components/days/DaysList';
import { UnfinishedTaskList } from 'components/tasks/UnfinishedTaskList';
import { CompletedTaskList } from 'components/tasks/CompletedTaskList';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<DaysList />

	<UnfinishedTaskList />

	<CompletedTaskList />
</OrangeTwist>, main);
