import type { Template } from 'database';
import type { AsyncDataState } from 'utils/asyncData';

import { render } from 'utils/markdown';

/**
 * A rendered Markdown template.
 */
export class HTMLMarkdownTemplateElement extends HTMLElement {
	static observedAttributes = ['name', 'args'];

	// Internal state
	#lastBuildState: AsyncDataState<Template> | null = null;

	// LiveData properties
	// TODO
	// #liveTaskWithStatus: LiveTaskWithStatus | null = null;

	// Internal markup
	// TODO
	// #initialEl: HTMLElement | null = null;
	// #errorEl: HTMLElement | null = null;
	// #linkEl: HTMLAnchorElement | null = null;
	// #iconEl: HTMLElement | null = null;
	// #iconMaskEl: HTMLElement | null = null;
	// #nameEl: HTMLElement | null = null;

	// AbortControllers
	#connectedAbortController: AbortController | null = null;
	// #taskIdChangeAbortController: AbortController | null = null;

	constructor() {
		super();
	}

	connectedCallback(): void {
		this.#connectedAbortController = new AbortController();
	}

	disconnectedCallback(): void {
		if (this.#connectedAbortController) {
			this.#connectedAbortController.abort();
			this.#connectedAbortController = null;
		}
	}

	connectedMoveCallback(): void {
		// This is present as a no-op just to prevent unnecessary calls to connectedCallback and disconnectedCallback on move
	}

	attributeChangedCallback(
		name: string,
		_oldValue: string | null,
		newValue: string | null,
	): void {
		// TODO
		// if (name !== 'taskid') {
		// 	return;
		// }

		// const taskId = this.#parseTaskId(newValue);
		// this.#setTaskId(taskId);
	}
}

function reference(template: Template, args: readonly string[]) {
	let output = template.definition;

	// Convert all {{{0|default}}} slots into numbers e.g. 0,
	// for matching with the appropriately indexed arg
	// TODO: Reuse the pattern in TemplateSync.tsx
	const slots = (output.match(/\{\{\{\d+(\|.+?)?}}}/g) ?? [])
		.map(
			(slot) => Number(
				slot.replace(
					/\{\{\{(\d+).+/,
					'$1'
				)
			)
		);

	for (const index of slots) {
		const arg = args[index];

		const replacePattern = new RegExp(
			`\\{\\{\\{${index}(\\|(.+?))?}}}`
		);
		const match = output.match(replacePattern);
		if (!match) {
			continue;
		}

		const defaultValue = match[2] ?? '';
		const replaceValue = arg || defaultValue;

		output = output.replace(match[0], replaceValue);
	}

	return render(output);
}
