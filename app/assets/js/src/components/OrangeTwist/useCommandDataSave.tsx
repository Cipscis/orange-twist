import { h, Fragment } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import {
	saveDays,
	saveDayTasks,
	saveTasks,
	saveTemplates,
} from 'data';

import { Command } from 'types/Command';
import type { SaveAction } from 'types/SaveAction';
import { registerCommand, useCommand } from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import { SaveHelper } from 'database';
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

let saveHelper: SaveHelper;

/**
 * Register the "Save data" command and its keyboard shortcut.
 */
export function useCommandDataSave({ persist }: UseCommandDataSaveOptions): void {
	useEffect(() => {
		saveHelper = saveHelper ?? new SaveHelper();
	}, []);

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
		async (saveActions?: readonly SaveAction[]) => {
			const id = 'saving';

			ui.alert(<>
				<span>Saving...</span>
				<Loader immediate />
			</>, { id, duration: null });

			try {
				await processSaveActions(persist, saveActions);
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

/**
 * Glue logic for handling both legacy "save all" behaviour, and new {@linkcode SaveAction} processing behaviour.
 */
async function processSaveActions(persist: PersistApi, saveActions?: readonly SaveAction[]): Promise<void> {
	// For the legacy "save all" action, save each register via the PersistApi
	if (typeof saveActions === 'undefined') {
		await Promise.all([
			saveTasks(persist),
			saveDays(persist),
			saveDayTasks(persist),
			saveTemplates(persist),
		]);
		return;
	}

	// Otherwise, process each save action
	await saveHelper.save(saveActions);
}
