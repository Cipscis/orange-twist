import { h, type JSX } from 'preact';

import { KeyboardShortcutName, getKeyboardShortcut } from '../registers/keyboard-shortcuts';

interface KeyboardShortcutCombosProps {
	keyboardShortcutName: KeyboardShortcutName;
}

/**
 * Render all the keyboard combos currently mapped to a named keyboard shortcut.
 */
export function KeyboardShortcutCombos(props: KeyboardShortcutCombosProps): JSX.Element {
	const { keyboardShortcutName } = props;

	// TODO: Create a hook so this stays up to date
	const combos = getKeyboardShortcut(keyboardShortcutName).shortcuts;

	return <>
		{
			combos.map((keyCombo, i) => (
				<span
					key={i}
					class="content"
				>
					{
						keyCombo.ctrl &&
						<><kbd>Ctrl</kbd>{' + '}</>
					}
					{
						keyCombo.alt &&
						<><kbd>Alt</kbd>{' + '}</>
					}
					{
						keyCombo.shift &&
						<><kbd>Shift</kbd>{' + '}</>
					}
					<kbd>{keyCombo.key}</kbd>
				</span>
			))
		}
	</>;
}
