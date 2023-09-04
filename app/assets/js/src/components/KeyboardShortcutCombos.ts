import { h } from 'preact';

import htm from 'htm';
import { KeyboardShortcutName, getKeyboardShortcut } from '../registers/keyboard-shortcuts/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface KeyboardShortcutCombosProps {
	keyboardShortcutName: KeyboardShortcutName;
}

/**
 * Render all the keyboard combos currently mapped to a named keyboard shortcut.
 */
export function KeyboardShortcutCombos(props: KeyboardShortcutCombosProps) {
	const { keyboardShortcutName } = props;

	// TODO: Create a hook so this stays up to date
	const combos = getKeyboardShortcut(keyboardShortcutName).shortcuts;

	return html`
		${combos.map((keyCombo) => html`
			${keyCombo.ctrl && html`<kbd>Ctrl</kbd> + `}
			${keyCombo.alt && html`<kbd>Alt</kbd> + `}
			${keyCombo.shift && html`<kbd>Shift</kbd> + `}
			<kbd>${keyCombo.key}</kbd>
		`)}
	`;
}
