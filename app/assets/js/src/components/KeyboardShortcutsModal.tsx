import { h, type JSX } from 'preact';
import { useState } from 'preact/hooks';

import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
	useKeyboardShortcuts,
} from '../registers/keyboard-shortcuts';

import { Modal } from './shared/Modal';
import { KeyboardShortcutCombos } from './KeyboardShortcutCombos';

registerKeyboardShortcut(KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN, [{ key: '?' }]);

/**
 * Renders a keyboard shortcuts modal, which displays
 * information about all bound keyboard shortcuts.
 *
 * This component is only intended to be used once per page.
 */
export function KeyboardShortcutModal(): JSX.Element {
	const [open, setOpen] = useState(false);
	useKeyboardShortcut(
		KeyboardShortcutName.KEYBOARD_SHORTCUTS_MODAL_OPEN,
		() => setOpen(true)
	);

	const keyboardShortcutsInfo = useKeyboardShortcuts();

	return <Modal
		open={open}
		onClose={() => setOpen(false)}
		title="Keyboard shortcuts"
	>
		<dl class="keyboard-shortcuts__list">
			{keyboardShortcutsInfo
				.filter(({ shortcuts }) => shortcuts.length > 0)
				.map((keyboardShortcutInfo) => (
					<div
						key={keyboardShortcutInfo.name}
						class="keyboard-shortcuts__item"
					>
						<dt class="keyboard-shortcuts__item__name">{keyboardShortcutInfo.name}</dt>

						<dd class="keyboard-shortcuts__item__combos">
							<KeyboardShortcutCombos
								keyboardShortcutName={keyboardShortcutInfo.name}
							/>
						</dd>
					</div>
				))}
		</dl>
	</Modal>;
}
