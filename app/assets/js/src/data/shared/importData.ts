import { chooseFile, readFileAsString } from 'util/index';
import * as ui from 'ui';

import { loadDays } from '../days';
import { loadTasks } from '../tasks';
import { loadDayTasks } from '../dayTasks';

/**
 * Prompt the user to select a file, then attempt to read it and
 * import its contents as data.
 *
 * If an error is encountered, an alert will be shown.
 */
export async function importData(): Promise<void> {
	const file = await chooseFile();
	if (!file) {
		return;
	}

	try {
		const dataString = await readFileAsString(file);
		const data = JSON.parse(dataString);

		// TODO: Use a Zod schema to validate this data
		if (!(
			data &&
			typeof data === 'object' &&
			'days' in data &&
			'tasks' in data &&
			'dayTasks' in data
		)) {
			ui.alert('Cannot import invalid data');
			return;
		}

		await Promise.all([
			loadDays(JSON.stringify(data.days)),
			loadTasks(JSON.stringify(data.tasks)),
			loadDayTasks(JSON.stringify(data.dayTasks)),
		]);
	} catch (e) {
		// TODO: Handle error
		if (e instanceof Error) {
			ui.alert(e.message);
		}
		console.error(e);
	}
}
