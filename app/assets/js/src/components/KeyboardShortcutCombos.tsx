import { Fragment, h } from 'preact';

import { KeyboardShortcutName, getKeyboardShortcut } from '../registers/keyboard-shortcuts/index.js';

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

	return <>
		{
			combos.map((keyCombo, i) => <Fragment key={i}>
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
			</Fragment>)
		}
	</>;
}
