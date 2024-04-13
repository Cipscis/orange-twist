import { h, render } from 'preact';

import { getPromiseWithResolver } from 'utils';

import { ModalPrompt } from './ModalPrompt';

const promptContainer = document.createElement('div');
document.body.append(promptContainer);

interface PromptOptions {
	placeholder?: string;
	/** @default 'text' */
	type?: string;
}

/**
 * Display a prompt asking the user to enter a string. The returned
 * `Promise` will resolve when the prompt is closed, either with the
 * string entered by the user or `null` if the prompt was cancelled.
 */
export async function prompt(
	message: string,
	options?: PromptOptions
): Promise<string | null> {
	const [resultPromise, resolve] = getPromiseWithResolver<string | null>();

	render(<ModalPrompt
		message={message}
		placeholder={options?.placeholder}
		type={options?.type ?? 'text'}
		resolve={resolve}
	/>, promptContainer);

	return resultPromise;
}
