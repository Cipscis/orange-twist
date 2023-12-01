import { h, render } from 'preact';

import { getPromiseWithResolver } from 'util/index';

import { ModalPrompt } from './ModalPrompt';

const promptContainer = document.createElement('div');
document.body.append(promptContainer);

export async function prompt(message: string): Promise<string | null> {
	const [resultPromise, resolve] = getPromiseWithResolver<string | null>();

	render(<ModalPrompt
		message={message}
		resolve={resolve}
	/>, promptContainer);

	return resultPromise;
}
