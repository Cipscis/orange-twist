import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';
import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

export interface UseCommandKeyboardShortcutShowState {
	keyboardShortcutsModalOpen: boolean;
	/** Open the keyboard shortcuts modal. */
	openKeyboardShortcutsModal: () => void;
	/** Close the keyboard shortcuts modal. */
	closeKeyboardShortcutsModal: () => void;
}

/**
 * Register the "Show keyboard shortcuts" command.
 */
export function useCommandKeyboardShortcutShow(): UseCommandKeyboardShortcutShowState {
	useEffect(() => {
		registerCommand(Command.KEYBOARD_SHORTCUT_SHOW, { name: 'Show keyboard shortcuts' });

		registerKeyboardShortcut(KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN, [{ key: '?' }]);
	}, []);

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

	return {
		keyboardShortcutsModalOpen,
		openKeyboardShortcutsModal,
		closeKeyboardShortcutsModal,
	};
}
