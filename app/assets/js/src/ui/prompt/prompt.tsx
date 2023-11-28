import { h, render } from 'preact';

import { ModalPrompt } from './ModalPrompt';
import { getPromiseWithResolver } from 'util/getPromiseWithResolver';

export const promptContainer = document.createElement('div');
document.body.append(promptContainer);

export async function prompt(message: string): Promise<string | null> {
	const [resultPromise, resolve] = getPromiseWithResolver<string | null>();

	render(<ModalPrompt
		message={message}
		resolve={resolve}
	/>, promptContainer);

	return resultPromise;
}
