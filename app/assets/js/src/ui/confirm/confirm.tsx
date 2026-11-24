import { h, render } from 'preact';

import { ModalConfirm } from './ModalConfirm';

const confirmContainer = document.createElement('div');
document.body.append(confirmContainer);

export function confirm(message: string): Promise<boolean> {
	const { promise: resultPromise, resolve } = Promise.withResolvers<boolean>();

	render(<ModalConfirm
		message={message}
		resolve={resolve}
	/>, confirmContainer);

	return resultPromise;
}
