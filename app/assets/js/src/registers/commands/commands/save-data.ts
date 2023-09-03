import { Command } from '../types/Command.js';

import { registerCommand } from '../commandsRegister.js';

import { KeyboardShortcutName, bindKeyboardShortcutToCommand } from '../../keyboard-shortcuts/index.js';

registerCommand({
	id: Command.DATA_SAVE,
	name: 'Save data',
});

bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, 'data-save');
