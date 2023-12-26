import { h, type ComponentChildren, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import {
	getAllDayInfo,
	getDayInfo,
	loadDays,
	saveDays,
	setDayInfo,

	createTask,
	loadTasks,
	saveTasks,

	loadDayTasks,
	saveDayTasks,
	setDayTaskInfo,

	exportData,
	importData,
} from 'data';

import { Command } from 'types/Command';
import {
	fireCommand,
	registerCommand,
	useCommand,
} from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import {
	getCurrentDateDayName,
	isValidDateString,
} from 'util/index';

import * as ui from 'ui';
import { Loader } from './shared/Loader';

import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal';
import { OrangeTwistContext } from './OrangeTwistContext';
import { IconButton } from './shared/IconButton';

interface OrangeTwistProps {
	/**
	 * If present, a back button will be shown.
	 */
	backButton?: boolean;

	children?: ComponentChildren;
}

/**
 * Renders a standard page layout and sets up
 * app-wide tools such as the command palette.
 */
export function OrangeTwist(props: OrangeTwistProps): JSX.Element {
	const {
		backButton,
		children,
	} = props;

	const [isLoading, setIsLoading] = useState(true);

	// Load persisted data
	useEffect(() => {
		Promise.all([
			loadDays().then(() => {
				// If there's no info for the current day, set up a stub
				const currentDateDayName = getCurrentDateDayName();
				if (getDayInfo(currentDateDayName) === null) {
					setDayInfo(currentDateDayName, {});
				}
			}),
			loadTasks(),
			loadDayTasks(),
		]).then(() => setIsLoading(false));
	}, []);

	// Register all commands and keyboard shortcuts
	useEffect(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
		registerCommand(Command.DATA_EXPORT, { name: 'Export data' });
		registerCommand(Command.DATA_IMPORT, { name: 'Import data' });
		registerCommand(Command.DAY_ADD_NEW, { name: 'Add new day' });
		registerCommand(Command.TASK_ADD_NEW, { name: 'Add new task' });
		registerCommand(Command.THEME_TOGGLE, { name: 'Toggle theme' });
		registerCommand(Command.KEYBOARD_SHORTCUT_SHOW, { name: 'Show keyboard shortcuts' });

		registerKeyboardShortcut(
			KeyboardShortcutName.COMMAND_PALETTE_OPEN,
			[{
				key: '\\',
			}],
		);
		registerKeyboardShortcut(KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN, [{ key: '?' }]);

		registerKeyboardShortcut(
			KeyboardShortcutName.DATA_SAVE,
			[{
				key: 's',
				ctrl: true,
			}],
		);
		registerKeyboardShortcut(
			KeyboardShortcutName.EDITING_FINISH,
			[
				{ key: 'Enter', ctrl: true },
				{ key: 'Escape' },
			]
		);
	}, []);

	/**
	 * Toggle between task and light themes.
	 */
	const toggleTheme = useCallback(() => {
		const htmlEl = document.documentElement;

		const currentTheme = getComputedStyle(htmlEl).getPropertyValue('--theme');

		const newTheme = (() => {
			if (currentTheme === 'light') {
				return 'dark';
			} else {
				return 'light';
			}
		})();

		// Insert a <style> tag to prevent transitions during theme toggle
		const flashStyle = document.createElement('style');
		flashStyle.innerHTML = `* {
			transition: none !important;
		}`;

		htmlEl.append(flashStyle);

		htmlEl.style.setProperty('--theme', newTheme);
		if (currentTheme) {
			htmlEl.classList.remove(currentTheme);
		}
		htmlEl.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);

		// The <style> tag can't be removed synchronously or it's not used for the next paint
		queueMicrotask(() => flashStyle.remove());
	}, []);
	useCommand(Command.THEME_TOGGLE, toggleTheme);

	// Open command palette on keyboard shortcut
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	/** Open the command palette. */
	const openCommandPalette = useCallback(
		() => setCommandPaletteOpen(true),
		[]
	);
	/** Close the command palette. */
	const closeCommandPalette = useCallback(
		() => setCommandPaletteOpen(false),
		[]
	);
	useKeyboardShortcut(
		KeyboardShortcutName.COMMAND_PALETTE_OPEN,
		openCommandPalette,
		!commandPaletteOpen
	);

	// Open keyboard shortcuts modal on keyboard shortcut
	const [keyboardShortcutsModalOpen, setKeyboardShortcutsModalOpen] = useState(false);
	/** Open the keyboard shortcuts modal. */
	const openKeyboardShortcutsModal = useCallback(
		() => setKeyboardShortcutsModalOpen(true),
		[]
	);
	/** Close the keyboard shortcuts modal. */
	const closeKeyboardShortcutsModal = useCallback(
		() => setKeyboardShortcutsModalOpen(false),
		[],
	);
	useCommand(Command.KEYBOARD_SHORTCUT_SHOW, openKeyboardShortcutsModal);
	useKeyboardShortcut(
		KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN,
		Command.KEYBOARD_SHORTCUT_SHOW,
		!keyboardShortcutsModalOpen
	);

	/**
	 * Save all data, while giving the user feedback.
	 */
	const saveData = useCallback(
		async () => {
			const id = `saving-${crypto.randomUUID()}`;

			ui.alert(<>
				<span>Saving...</span>
				<Loader immediate />
			</>, { id, duration: null });
			await Promise.all([
				saveDays(),
				saveTasks(),
				saveDayTasks(),
			]);
			ui.alert('Saved', {
				duration: 2000,
				id,
			});
		},
		[]
	);
	useCommand(Command.DATA_SAVE, saveData);
	useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

	useCommand(Command.DATA_EXPORT, exportData);
	useCommand(Command.DATA_IMPORT, importData);

	/**
	 * Ask the user what day to add, then add it to the register.
	 */
	const addNewDay = useCallback(async (dayNameArg?: string) => {
		const days = getAllDayInfo();

		const dayName = dayNameArg ?? await ui.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			ui.alert('Invalid day');
			return;
		}

		const existingDayData = days.find((day) => day.name === dayName);
		if (existingDayData) {
			ui.alert('Day already exists');
			return;
		}

		setDayInfo(dayName, {});
	}, []);
	useCommand(Command.DAY_ADD_NEW, addNewDay);

	const createNewTask = useCallback(async (dayName?: string) => {
		const name = await ui.prompt('Task name');
		if (!name) {
			return;
		}

		const taskId = createTask({ name });
		if (dayName) {
			setDayTaskInfo({ dayName, taskId }, {});
		}

		fireCommand(Command.DATA_SAVE);
	}, []);
	useCommand(Command.TASK_ADD_NEW, createNewTask);

	return <OrangeTwistContext.Provider
		value={{
			isLoading,
		}}
	>
		<CommandPalette
			open={commandPaletteOpen}
			onClose={closeCommandPalette}
		/>

		<div class="orange-twist">
			{
				backButton &&
				<IconButton
					icon="<"
					title="Back"
					href="../"
					class="orange-twist__back"
				/>
			}

			<h1 class="orange-twist__heading">Orange Twist</h1>

			<div class="orange-twist__tools">
				<IconButton
					icon="\"
					title="Open command prompt"
					onClick={openCommandPalette}
				/>

				<IconButton
					icon="?"
					title="Show keyboard shortcuts"
					onClick={openKeyboardShortcutsModal}
				/>
			</div>

			{children}
		</div>

		<KeyboardShortcutModal
			open={keyboardShortcutsModalOpen}
			onClose={closeKeyboardShortcutsModal}
		/>
	</OrangeTwistContext.Provider>;
}
