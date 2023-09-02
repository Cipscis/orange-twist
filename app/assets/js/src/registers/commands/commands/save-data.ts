import { KeyboardShortcutName } from '../../keyboard-shortcuts/index.js';
import { bindKeyboardShortcutToCommand } from '../../keyboard-shortcuts/listeners/bindKeyboardShortcutToCommand.js';
import { registerCommand } from '../commandsRegister.js';

registerCommand({
	id: 'save-data',
	name: 'Save data',
});

bindKeyboardShortcutToCommand(KeyboardShortcutName.DATA_SAVE, 'save-data');
