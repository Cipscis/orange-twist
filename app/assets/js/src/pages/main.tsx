import { h, render } from 'preact';

import { OrangeTwist } from 'components/OrangeTwist';
import { AllDays } from 'components/days/AllDays';
import {
	UnfinishedTaskList,
	CompletedTaskList,
} from 'components/tasks/TaskList';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist scrollToActiveDay>
	<AllDays />

	<UnfinishedTaskList />

	<CompletedTaskList />
</OrangeTwist>, main);
