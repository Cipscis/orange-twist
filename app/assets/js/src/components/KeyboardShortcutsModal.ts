import { h } from 'preact';
import { useState } from 'preact/hooks';

import htm from 'htm';

import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
	useKeyboardShortcuts,
} from '../registers/keyboard-shortcuts/index.js';

import { Modal } from './shared/Modal.js';
import { KeyboardShortcutCombos } from './KeyboardShortcutCombos.js';

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
			title="Keyboard shortcuts"
		>
			<dl class="keyboard-shortcuts__list">
				${keyboardShortcutsInfo.map((keyboardShortcutInfo) => html`
					<div
						key="${keyboardShortcutInfo.name}"
						class="keyboard-shortcuts__item"
					>
						<dt class="keyboard-shortcuts__item__name">${keyboardShortcutInfo.name}</dt>

						<dd class="keyboard-shortcuts__item__combos">
							${keyboardShortcutInfo.shortcuts.map((shortcut, i) => html`
								<span
									key="${`${keyboardShortcutInfo.name}-${i}`}"
									class="keyboard-shortcuts__item__combo content"
								>
									<${KeyboardShortcutCombos} keyboardShortcutName="${keyboardShortcutInfo.name}" />
								</span>
							`)}
						</dd>
					</div>
				`)}
			</dl>
		</${Modal}>
	`;
}
