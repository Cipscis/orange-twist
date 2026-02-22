import { useCallback, useEffect } from 'preact/hooks';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

/**
 * Register the "Toggle theme" command.
 */
export function useCommandThemeToggle(): void {
	useEffect(() => {
		registerCommand(Command.THEME_TOGGLE, { name: 'Toggle theme' });
	}, []);

	/**
	 * Toggle between task and light themes.
	 */
	const toggleTheme = useCallback(() => {
		const htmlEl = document.documentElement;

		const currentTheme = getComputedStyle(htmlEl).getPropertyValue('--theme');

		const newTheme = (() => {
			if (currentTheme === 'light') {
				return 'dark';
			} else {
				return 'light';
			}
		})();

		// Insert a <style> tag to prevent transitions during theme toggle
		const flashStyle = document.createElement('style');
		flashStyle.innerHTML = `* {
			transition: none !important;
		}`;

		htmlEl.append(flashStyle);

		htmlEl.style.setProperty('--theme', newTheme);
		if (currentTheme) {
			htmlEl.classList.remove(currentTheme);
		}
		htmlEl.classList.add(newTheme);
		localStorage.setItem('theme', newTheme);

		// The <style> tag can't be removed synchronously or it's not used for the next paint
		queueMicrotask(() => flashStyle.remove());
	}, []);

	useCommand(Command.THEME_TOGGLE, toggleTheme);
}
