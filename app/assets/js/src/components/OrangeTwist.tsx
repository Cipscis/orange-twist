import { ComponentChildren, h } from 'preact';
import {
	useCallback,
	useState,
} from 'preact/hooks';

import { saveDays } from '../registers/days/index.js';
import { saveTasks } from '../registers/tasks/index.js';

import { Command, useCommand } from '../registers/commands/index.js';
import { KeyboardShortcutName, useKeyboardShortcut } from '../registers/keyboard-shortcuts/index.js';

import { toast } from './Toast.js';

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

	// Open command palette on keyboard shortcut
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	useKeyboardShortcut(
		KeyboardShortcutName.COMMAND_PALETTE_OPEN,
		() => setCommandPaletteOpen(true)
	);

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

	return <>
		<CommandPalette
			open={commandPaletteOpen}
			onClose={() => setCommandPaletteOpen(false)}
		/>

		<div class="orange-twist">
			<h1 class="orange-twist__heading">Orange Twist</h1>

			{children}
		</div>

		<KeyboardShortcutModal />
	</>;
}
