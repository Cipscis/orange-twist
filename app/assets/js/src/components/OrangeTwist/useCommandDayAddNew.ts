import { useCallback, useEffect } from 'preact/hooks';

import { getAllDayInfo, setDayInfo } from 'data';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

import { isValidDateString } from 'utils';

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
		const days = getAllDayInfo();

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

		const existingDayData = days.find((day) => day.name === dayName);
		if (existingDayData) {
			ui.alert(`Day ${dayName} already exists`);
			return;
		}

		setDayInfo(dayName, {});
	}, []);
	useCommand(Command.DAY_ADD_NEW, addNewDay);
}
