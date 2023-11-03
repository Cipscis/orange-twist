import { Command } from '../types/Command';
import { registerCommand } from '../commandsRegister';
import { addCommandListener } from '../listeners/addCommandListener';

registerCommand({
	id: Command.THEME_TOGGLE,
	name: 'Toggle theme',
});

function toggleTheme() {
	const htmlEl = document.documentElement;

	const currentTheme = getComputedStyle(htmlEl).getPropertyValue('--theme');

	const newTheme = (() => {
		if (currentTheme === 'light') {
			return 'dark';
		} else {
			return 'light';
		}
	})();

	htmlEl.style.setProperty('--theme', newTheme);
	localStorage.setItem('theme', newTheme);
}

addCommandListener(Command.THEME_TOGGLE, toggleTheme);
