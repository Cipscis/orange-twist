import { useEffect, useState } from 'preact/hooks';

import { KeyboardShortcutInfo } from '../types/index.js';
import { onNewKeyboardShortcutRegistered } from '../listeners/index.js';

import { getKeyboardShortcuts } from '../getKeyboardShortcuts.js';

export function useKeyboardShortcuts(): ReadonlyArray<Readonly<KeyboardShortcutInfo>> {
	// Try to initialise with existing data
	const [keyboardShortcuts, setKeyboardShortcuts] = useState<ReadonlyArray<Readonly<KeyboardShortcutInfo>>>(getKeyboardShortcuts);

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		// Update keyboard shortcuts whenever a new one is added
		onNewKeyboardShortcutRegistered((newKeyboardShortcut) => {
			setKeyboardShortcuts((keyboardShortcuts) => {
				// Start by creating a new array
				const newKeyboardShortcuts = [...keyboardShortcuts];

				// Then, if there's already an entry with this name, remove it
				const currentIndex = newKeyboardShortcuts.findIndex(({ name }) => name === newKeyboardShortcut.name);
				if (currentIndex !== -1) {
					newKeyboardShortcuts.splice(currentIndex, 1);
				}

				// Finally, append the new entry to the end
				return newKeyboardShortcuts.concat(newKeyboardShortcut);
			});
		}, { signal });

		return () => controller.abort();
	}, []);

	return keyboardShortcuts;
}
