import { KeyboardShortcutName } from '../types/KeyboardShortcutName.js';
import { registerKeyboardShortcut } from '../keyboardShortcutsRegister.js';

registerKeyboardShortcut(
	KeyboardShortcutName.COMMAND_PALETTE_OPEN,
	[{
		key: '\\',
	}],
);
