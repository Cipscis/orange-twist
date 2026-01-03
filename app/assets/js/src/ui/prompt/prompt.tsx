import { h, render } from 'preact';

import { getPromiseWithResolver, type EnumTypeOf } from 'utils';

import { ModalPrompt } from './ModalPrompt';

const promptContainer = document.createElement('div');
document.body.append(promptContainer);

export const PromptType = {
	TEXT: 'text',
	DATE: 'date',
	TASK: 'task',
} as const;
export type PromptType = EnumTypeOf<typeof PromptType>;

export type PromptReturnType = {
	[PromptType.TEXT]: string;
	[PromptType.DATE]: string;
	[PromptType.TASK]: number;
};

interface PromptOptions<T extends PromptType> {
	placeholder?: string;
	type: T;
}

/**
 * Display a prompt asking the user to enter a string. The returned
 * `Promise` will resolve when the prompt is closed, either with the
 * string entered by the user or `null` if the prompt was cancelled.
 */
export async function prompt<T extends PromptType>(
	message: string,
	options: PromptOptions<T>
): Promise<PromptReturnType[T] | null> {
	const [resultPromise, resolve] = getPromiseWithResolver<PromptReturnType[T] | null>();

	render(<ModalPrompt
		message={message}
		placeholder={options?.placeholder}
		type={options.type}
		resolve={resolve}
	/>, promptContainer);

	return resultPromise;
}
