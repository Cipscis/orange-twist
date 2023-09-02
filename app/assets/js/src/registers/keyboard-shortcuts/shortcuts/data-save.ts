import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { registerKeyboardShortcut } from '../keyboardShortcutsRegister.js';

registerKeyboardShortcut(
	KeyboardShortcutName.DATA_SAVE,
	[{
		key: 's',
		ctrl: true,
	}],
);
