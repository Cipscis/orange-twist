/**
 * @file This file is render-blocking, and is used only for
 * JavaScript that must fire before the page is rendered.
 *
 * It's important that none of its imports include third party
 * libraries, to keep its file size to an absolute minimum.
 */

import { isTheme } from './types/Theme';

const theme = localStorage.getItem('theme');
if (isTheme(theme)) {
	document.documentElement.style.setProperty('--theme', theme);
}
