import { beforeAll, jest } from '@jest/globals';

/**
 * Set up a bare bones polyfill of `HTMLDialogElement`,
 * enough to allow tests to run, because it's not supported
 * in jsdom.
 *
 * @see {@link https://github.com/jsdom/jsdom/issues/3294 Any plans to add support for the HTMLDialogElement? #3294}
 * @see {@link https://github.com/jsdom/jsdom/pull/3403 Dialog Element Implementation #3403}
 */
function polyfillDialogElement() {
	HTMLDialogElement.prototype.show = jest.fn(
		function (this: HTMLDialogElement) {
			this.open = true;
			const input = this.querySelector('input');
			if (input) {
				input.focus();
			} else {
				this.focus();
			}
		}
	);

	HTMLDialogElement.prototype.showModal = jest.fn(
		function (this: HTMLDialogElement) {
			this.open = true;
			const input = this.querySelector('input');
			if (input) {
				input.focus();
			} else {
				this.focus();
			}
		}
	);

	HTMLDialogElement.prototype.close = jest.fn(
		function (this: HTMLDialogElement) {
			this.open = false;
		}
	);

	// Send close events to dialogs on "Escape" press, and close them
	document.addEventListener('keydown', ({ key }) => {
		if (key === 'Escape') {
			document.querySelectorAll('dialog').forEach((dialog) => {
				dialog.dispatchEvent(new Event('close'));
				dialog.close();
			});
		}
	});
}

beforeAll(() => {
	polyfillDialogElement();
});
