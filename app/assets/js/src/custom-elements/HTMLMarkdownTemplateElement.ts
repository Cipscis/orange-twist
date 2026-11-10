import { assertAllUnionMembersHandled } from 'utils/assertAllUnionMembersHandled';
import { AsyncDataStateType } from 'utils/asyncData';
import { renderInline } from 'utils/markdown';
import { templateArgsPattern } from 'utils/templateArgsPattern';

import { LiveNamedTemplate, type Template } from 'database';

import { HTMLLiveDataElement } from './HTMLLiveDataElement';
import { getSanitiser } from './getSanitiser';

/**
 * A rendered Markdown template.
 */
export class HTMLMarkdownTemplateElement extends HTMLLiveDataElement<Template> {
	static observedAttributes = ['name', 'args'];

	#args: readonly string[] = [];

	constructor() {
		super();
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		super.attributeChangedCallback(name, oldValue, newValue);

		if (name === 'name') {
			if (newValue === null) {
				this.clearLiveData();
			} else {
				this.setLiveData(new LiveNamedTemplate(newValue));
			}
			return;
		}

		if (name === 'args') {
			if (newValue === null) {
				this.#args = [];
			} else {
				try {
					const args = JSON.parse(newValue);
					if (
						Array.isArray(args) &&
						args.every(
							(el) => typeof el === 'string'
						)
					) {
						this.#args = args;
					} else {
						this.#args = [];
					}
				} catch {
					this.#args = [];
				}
			}
		}
	}

	render(): void {
		super.render();

		const buildState = this.liveData?.state ?? {
			type: AsyncDataStateType.ERROR,
			error: new Error('No valid name attribute was found'),
			loading: false,
		};

		// Start by clearing things out
		if (this.firstChild) {
			this.removeChild(this.firstChild);
		}

		if (buildState.type === AsyncDataStateType.INITIAL) {
			// Do nothing
		} else if (buildState.type === AsyncDataStateType.SUCCESS) {
			this.#renderSuccess(buildState.data);
		} else if (buildState.type === AsyncDataStateType.ERROR) {
			this.#renderError(buildState.error);
		} else {
			assertAllUnionMembersHandled(buildState);
		}
	}

	async #renderSuccess(template: Template): Promise<void> {
		let output = template.definition;

		// Convert all {{{0|default}}} slots into numbers e.g. 0,
		// for matching with the appropriately indexed arg
		const slots = (output.match(templateArgsPattern) ?? [])
			.map(
				(slot) => Number(
					slot.replace(
						/\{\{\{(\d+).+/,
						'$1'
					)
				)
			);

		for (const index of slots) {
			const arg = this.#args[index];

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

		const renderResult = await renderInline(output);

		if (this.setHTML) {
			this.setHTML(renderResult, { sanitizer: getSanitiser() });
		} else {
			this.setHTMLUnsafe(renderResult);
		}
	}

	#renderError(error: Error): void {
		const message = `<i>{{${error.message}}}</i>`;

		if (this.setHTML) {
			this.setHTML(message, { sanitizer: getSanitiser() });
		} else {
			this.setHTMLUnsafe(message);
		}
	}
}
