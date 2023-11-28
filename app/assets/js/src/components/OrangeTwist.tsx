import { h, type ComponentChildren, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import { Command } from 'types/Command';

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
} from 'data';

import {
	registerCommand,
	useCommand,
} from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import { getCurrentDateDayName, isValidDateString } from 'util/index';
import { alert } from 'ui';

import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal';

interface OrangeTwistProps {
	children?: ComponentChildren;
}

/**
 * Renders a standard page layout and sets up
 * app-wide tools such as the command palette.
 */
export function OrangeTwist(props: OrangeTwistProps): JSX.Element {
	const { children } = props;

	// Load persisted data
	useEffect(() => {
		loadDays().then(() => {
			// If there's no info for the current day, set up a stub
			const currentDateDayName = getCurrentDateDayName();
			if (getDayInfo(currentDateDayName) === null) {
				setDayInfo(currentDateDayName, {});
			}
		});
		loadTasks();
		loadDayTasks();
	}, []);

	// Register all commands and keyboard shortcuts
	useEffect(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
		registerCommand(Command.DAY_ADD_NEW, { name: 'Add new day' });
		registerCommand(Command.TASK_ADD_NEW, { name: 'Add new task' });
		registerCommand(Command.THEME_TOGGLE, { name: 'Toggle theme' });

		registerKeyboardShortcut(
			KeyboardShortcutName.COMMAND_PALETTE_OPEN,
			[{
				key: '\\',
			}],
		);
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

		htmlEl.style.setProperty('--theme', newTheme);
		localStorage.setItem('theme', newTheme);
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
	useKeyboardShortcut(KeyboardShortcutName.COMMAND_PALETTE_OPEN, openCommandPalette);

	/**
	 * Save all day and task data, while giving the user feedback.
	 */
	const saveData = useCallback(
		async () => {
			const id = `saving-${crypto.randomUUID()}`;

			// TODO: Show a nicer loader
			alert('Saving...', { id });
			await Promise.all([
				saveDays(),
				saveTasks(),
				saveDayTasks(),
			]);
			alert('Saved', {
				duration: 2000,
				id,
			});
		},
		[]
	);
	useCommand(Command.DATA_SAVE, saveData);
	useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

	/**
	 * Ask the user what day to add, then add it to the register.
	 */
	const addNewDay = useCallback((dayNameArg?: string) => {
		const days = getAllDayInfo();

		const dayName = dayNameArg ?? window.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			window.alert('Invalid day');
			return;
		}

		const existingDayData = days.find((day) => day.name === dayName);
		if (existingDayData) {
			window.alert('Day already exists');
			return;
		}

		setDayInfo(dayName, {});
	}, []);
	useCommand(Command.DAY_ADD_NEW, addNewDay);

	const createNewTask = useCallback((dayName?: string) => {
		const taskId = createTask();
		if (dayName) {
			setDayTaskInfo({ dayName, taskId }, {});
		}
	}, []);
	useCommand(Command.TASK_ADD_NEW, createNewTask);

	return <>
		<CommandPalette
			open={commandPaletteOpen}
			onClose={closeCommandPalette}
		/>

		<div class="orange-twist">
			<h1 class="orange-twist__heading">Orange Twist</h1>

			{children}
		</div>

		<KeyboardShortcutModal />
	</>;
}
