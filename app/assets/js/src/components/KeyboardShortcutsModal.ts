import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import htm from 'htm';

import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
	useKeyboardShortcuts,
} from '../registers/keyboard-shortcuts/index.js';

import { Modal } from './shared/Modal.js';

// Initialise htm with Preact
const html = htm.bind(h);

registerKeyboardShortcut(KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN, [{ key: '?' }]);

export function KeyboardShortcutModal() {
	const [open, setOpen] = useState(false);
	useKeyboardShortcut(
		KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN,
		() => setOpen(true)
	);

	const keyboardShortcutsInfo = useKeyboardShortcuts();

	return html`
		<${Modal}
			open="${open}"
			onClose="${() => setOpen(false)}"
		>
			<h2>Keyboard shortcuts</h2>

			<dl>
				${keyboardShortcutsInfo.map((keyboardShortcutInfo) => html`
					<div key="${keyboardShortcutInfo.name}">
						<dt>${keyboardShortcutInfo.name}</dt>

						<dd>
							${keyboardShortcutInfo.shortcuts.map((shortcut, i) => html`
								<li key="${`${keyboardShortcutInfo.name}-${i}`}">
									${shortcut.ctrl && html`<kbd>Ctrl</kbd> + `}
									${shortcut.alt && html`<kbd>Alt</kbd> + `}
									${shortcut.shift && html`<kbd>Shift</kbd> + `}
									<kbd>${shortcut.key}</kbd>
								</li>
							`)}
						</dd>
					</div>
				`)}
			</dl>
		</${Modal}>
	`;
}
