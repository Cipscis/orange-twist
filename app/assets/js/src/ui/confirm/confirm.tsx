import { h, render } from 'preact';

import { getPromiseWithResolver } from 'utils';

import { ModalConfirm } from './ModalConfirm';

const confirmContainer = document.createElement('div');
document.body.append(confirmContainer);

export function confirm(message: string): Promise<boolean> {
	const [resultPromise, resolve] = getPromiseWithResolver<boolean>();

	render(<ModalConfirm
		message={message}
		resolve={resolve}
	/>, confirmContainer);

	return resultPromise;
}
