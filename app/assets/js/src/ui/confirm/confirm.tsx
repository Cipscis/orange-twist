import { h, render } from 'preact';

import { getPromiseWithResolver } from 'util/index';

import { ModalConfirm } from './ModalConfirm';

export function confirm(message: string): Promise<boolean> {
	const [resultPromise, resolve] = getPromiseWithResolver<boolean>();

	render(<ModalConfirm
		message={message}
		resolve={resolve}
	/>, document.body);

	return resultPromise;
}
