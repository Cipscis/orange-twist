import { ComponentChildren, h } from 'preact';
import {
	useCallback,
	useState,
} from 'preact/hooks';

import { saveDays, setDayData, useDays } from '../registers/days/index.js';
import { addNewTask, saveTasks } from '../registers/tasks/index.js';

import { Command, useCommand } from '../registers/commands/index.js';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from '../registers/keyboard-shortcuts/index.js';

import { isValidDateString } from '../util/index.js';
import { toast } from './shared/Toast.js';

import { CommandPalette } from './CommandPalette/CommandPalette.js';
import { KeyboardShortcutModal } from './KeyboardShortcutsModal.js';

interface OrangeTwistProps {
	children: ComponentChildren;
}

/**
 * Renders a standard page layout and sets up
 * app-wide tools such as the command palette.
 */
export function OrangeTwist(props: OrangeTwistProps) {
	const { children } = props;

	const {
		data: days,
	} = useDays();

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
		if (!days) {
			return;
		}

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
	}, [days]);
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
