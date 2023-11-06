import { h, type ComponentChildren, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import { Command } from 'types/Command';

import { getDays, saveDays, setDayData } from 'registers/days';
import { addNewTask, saveTasks } from 'registers/tasks';

import { registerCommand, useCommand } from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import { isValidDateString } from 'util/index';
import { toast } from './shared/Toast';

import { CommandPalette } from './CommandPalette/CommandPalette';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal';

interface OrangeTwistProps {
	children: ComponentChildren;
}

/**
 * Renders a standard page layout and sets up
 * app-wide tools such as the command palette.
 */
export function OrangeTwist(props: OrangeTwistProps): JSX.Element {
	const { children } = props;

	// Register all commands
	useEffect(() => {
		registerCommand(Command.DATA_SAVE, { name: 'Save data' });
		registerCommand(Command.DAY_ADD_NEW, { name: 'Add new day' });
		registerCommand(Command.TASK_ADD_NEW, { name: 'Add new task' });
		registerCommand(Command.THEME_TOGGLE, { name: 'Toggle theme' });
	});

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
	registerKeyboardShortcut(
		KeyboardShortcutName.COMMAND_PALETTE_OPEN,
		[{
			key: '\\',
		}],
	);
	useKeyboardShortcut(KeyboardShortcutName.COMMAND_PALETTE_OPEN, openCommandPalette);

	/**
	 * Save all day and task data, while giving the user feedback.
	 */
	const saveData = useCallback(
		async () => {
			const toastId = `saving-${crypto.randomUUID()}`;

			// TODO: Show a nicer loader
			toast('Saving...', {
				id: toastId,
			});
			await Promise.all([
				saveDays(),
				saveTasks(),
			]);
			toast('Saved', {
				duration: 2000,
				id: toastId,
			});
		},
		[]
	);
	useCommand(Command.DATA_SAVE, saveData);

	// Set up save data keyboard shortcut
	registerKeyboardShortcut(
		KeyboardShortcutName.DATA_SAVE,
		[{
			key: 's',
			ctrl: true,
		}],
	);
	useKeyboardShortcut(KeyboardShortcutName.DATA_SAVE, Command.DATA_SAVE);

	/**
	 * Ask the user what day to add, then add it to the register.
	 */
	const addNewDay = useCallback((dayNameArg?: string) => {
		const days = getDays();

		const dayName = dayNameArg ?? window.prompt('What day?');
		if (!dayName) {
			return;
		}
		if (!isValidDateString(dayName)) {
			window.alert('Invalid day');
			return;
		}

		const existingDayData = days.find((day) => day.dayName === dayName);
		if (existingDayData) {
			window.alert('Day already exists');
			return;
		}

		setDayData(dayName, {});
	}, []);
	useCommand(Command.DAY_ADD_NEW, addNewDay);

	/**
	 * Create a new task.
	 *
	 * @param [dayName] - If specified, the new task will be
	 * created against this specified day.
	 */
	const addNewTaskWithOptions = useCallback((dayName?: string) => addNewTask({ dayName }), []);
	useCommand(Command.TASK_ADD_NEW, addNewTaskWithOptions);

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
