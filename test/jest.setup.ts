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

/**
 * jsdom hasn't implemented window.scrollTo, so replace it
 * with a mocked function so it won't cause JavaScript errors.
 */
function polyfillWindowScrollto() {
	window.scrollTo = jest.fn();
}

/**
 * jsdom hasn't implemented Element.scrollIntoView, so replace it
 * with a mocked function so it won't cause JavaScript errors.
 */
function polyfillElementScrollIntoView() {
	window.Element.prototype.scrollIntoView = jest.fn();
}

class BroadcastChannel {
	constructor(name: string) {
		this.name = name;
	}

	name: string;

	onmessage = jest.fn();
	onmessageerror = jest.fn();
	close = jest.fn();
	postMessage = jest.fn();
	addEventListener = jest.fn();
	removeEventListener = jest.fn();
	dispatchEvent = () => true;
}

/**
 * jsdom hasn't implemented the BroadcastChannel API, so replace it
 * with a mocked version so it won't cause JavaScript errors.
 */
function polyfillBroadcastChannelApi() {
	window.BroadcastChannel = BroadcastChannel;
}

polyfillBroadcastChannelApi();

beforeAll(() => {
	polyfillDialogElement();
	polyfillWindowScrollto();
	polyfillElementScrollIntoView();
});

// Define global constants usually replaced using esbuild's "define" option
Object.assign(global, {
	__VERSION__: 'test',
});
