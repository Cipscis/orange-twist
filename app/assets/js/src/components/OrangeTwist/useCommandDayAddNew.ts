import { useCallback, useEffect } from 'preact/hooks';

import { Command } from 'types/Command';
import {
	fireCommand,
	registerCommand,
	useCommand,
} from 'registers/commands';

import { isValidDateString } from 'utils';
import {
	getDayNameParts,
	loadAllDays,
	SaveType,
} from 'database';

import * as ui from 'ui';

/**
 * Registers the "Add new day" command.
 */
export function useCommandDayAddNew(): void {
	useEffect(() => {
		registerCommand(Command.DAY_ADD_NEW, { name: 'Add new day' });
	}, []);

	/**
	 * Ask the user what day to add, then add it to the register.
	 */
	const addNewDay = useCallback(async (dayNameArg?: string) => {
		const dayName = dayNameArg ?? await ui.prompt('What day?', {
			type: ui.PromptType.DATE,
		});
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert(`Invalid day ${dayName}`);
			return;
		}
		const [year, month, day] = getDayNameParts(dayName);

		const days = await loadAllDays();
		const existingDayData = days.find((dbDay) => (
			dbDay.year === year &&
			dbDay.month === month &&
			dbDay.day === day
		));
		if (existingDayData) {
			ui.alert(`Day ${dayName} already exists`);
			return;
		}

		fireCommand(Command.DATA_SAVE, ([{
			type: SaveType.DAY_ADD,
			day: {
				year,
				month,
				day,
				note: '',
			},
		}]));
	}, []);

	useCommand(Command.DAY_ADD_NEW, addNewDay);
}
