import { useState } from 'preact/hooks';

import { KeyboardShortcutInfo } from '../types/index.js';
import { onNewKeyboardShortcutRegistered } from '../listeners/index.js';

import { getKeyboardShortcuts } from '../getKeyboardShortcuts.js';

export function useKeyboardShortcuts(): ReadonlyArray<Readonly<KeyboardShortcutInfo>> {
	// Try to initialise with existing data
	const [keyboardShortcuts, setKeyboardShortcuts] = useState<ReadonlyArray<Readonly<KeyboardShortcutInfo>>>(getKeyboardShortcuts);

	// Update keyboard shortcuts whenever a new one is added
	onNewKeyboardShortcutRegistered((newKeyboardShortcut) => {
		setKeyboardShortcuts(
			(keyboardShortcuts) => keyboardShortcuts.concat(newKeyboardShortcut)
		);
	});

	return keyboardShortcuts;
}
