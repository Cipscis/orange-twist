import { h, Fragment } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import {
	saveDays,
	saveDayTasks,
	saveTasks,
	saveTemplates,
} from 'data';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import type { PersistApi } from 'persist';
import { syncUpdate } from 'sync';

import * as ui from 'ui';
import { Loader } from 'components/shared';

export interface UseCommandDataSaveOptions {
	/**
	 * A {@linkcode PersistApi} to use when saving data.
	 */
	persist: PersistApi;
}

/**
 * Register the "Save data" command and its keyboard shortcut.
 */
export function useCommandDataSave({ persist }: UseCommandDataSaveOptions): void {
	useEffect(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
	}, []);

	registerKeyboardShortcut(
		KeyboardShortcutName.DATA_SAVE,
		[{
			key: 's',
			ctrl: true,
		}],
	);

	/**
	 * Save all data, while giving the user feedback.
	 */
	const saveData = useCallback(
		async () => {
			const id = 'saving';

			ui.alert(<>
				<span>Saving...</span>
				<Loader immediate />
			</>, { id, duration: null });
			try {
				await Promise.all([
					saveDays(persist),
					saveTasks(persist),
					saveDayTasks(persist),
					saveTemplates(persist),
				]);
				ui.alert('Saved', {
					duration: 2000,
					id,
				});

				syncUpdate();
			} catch (e) {
				ui.alert('Failed to save', {
					id,
					duration: null,
					dismissible: true,
				});
				console.error(e);
			}
		},
		[persist]
	);

	useCommand(Command.DATA_SAVE, saveData);

	useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);
}
