import { assertAllUnionMembersHandled } from 'utils/assertAllUnionMembersHandled';
import { createElement } from 'utils/createElement';
import {
	AsyncActionStateType,
	type AsyncActionState,
	HTMLLiveDataElement,
} from 'utils/asyncAction';
import { renderInline } from 'utils/markdown';

import { getTaskDetailUrl } from 'navigation';
import {
	LiveTaskWithStatus,
	type Status,
	type Task,
} from 'database';

import { getSanitiser } from './getSanitiser';

type TaskLinkStateElements = {
	[AsyncActionStateType.INITIAL]: {
		initialEl: HTMLElement;
	};
	[AsyncActionStateType.ERROR]: {
		errorEl: HTMLElement;
	};
	[AsyncActionStateType.SUCCESS]: {
		iconEl: HTMLElement;
		linkEl: HTMLAnchorElement;
		nameEl: HTMLElement;
	};
};

/**
 * A link to a task that displays a live view of its status and name.
 */
export class HTMLTaskLinkElement extends HTMLLiveDataElement<[Task, Status]> {
	static observedAttributes = ['taskid'];

	// Internal state
	#lastBuildState: AsyncActionState<[Task, Status]> | null = null;

	// Internal markup
	#initialEl: HTMLElement | null = null;
	#errorEl: HTMLElement | null = null;
	#linkEl: HTMLAnchorElement | null = null;
	#iconEl: HTMLElement | null = null;
	#iconMaskEl: HTMLElement | null = null;
	#nameEl: HTMLElement | null = null;

	constructor() {
		super();
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		super.attributeChangedCallback(name, oldValue, newValue);

		if (name !== 'taskid') {
			return;
		}

		const taskId = this.#parseTaskId(newValue);

		if (taskId === null) {
			this.clearLiveData();
			return;
		}

		this.setLiveData(new LiveTaskWithStatus(taskId));
	}

	/**
	 * Turn an attribute value for 'taskid' into a value that can be used directly.
	 */
	#parseTaskId(value: string | null): number | null {
		if (value === null) {
			return null;
		}

		const taskId = parseInt(value, 10);
		if (isNaN(taskId)) {
			return null;
		}

		return taskId;
	}

	render(): void {
		super.render();

		const oldBuildState = this.#lastBuildState;
		const newBuildState = this.liveData?.state ?? {
			type: AsyncActionStateType.ERROR,
			error: new Error('No valid taskid attribute was found'),
			loading: false,
		};

		this.#lastBuildState = newBuildState;

		if (newBuildState.type === AsyncActionStateType.INITIAL) {
			const elements = this.#buildInitialMarkup(oldBuildState);
			this.#applyInitialContent(elements, oldBuildState, newBuildState);
		} else if (newBuildState.type === AsyncActionStateType.ERROR) {
			const elements = this.#buildErrorMarkup(oldBuildState);
			this.#applyErrorContent(elements, oldBuildState, newBuildState);
		} else if (newBuildState.type === AsyncActionStateType.SUCCESS) {
			const elements = this.#buildSuccessMarkup(oldBuildState);
			this.#applySuccessContent(elements, oldBuildState, newBuildState);
		} else {
			assertAllUnionMembersHandled(newBuildState);
		}
	}

	#buildInitialMarkup(
		oldBuildState: AsyncActionState<[Task, Status]> | null,
	): TaskLinkStateElements[typeof AsyncActionStateType.INITIAL] {
		if (oldBuildState?.type === AsyncActionStateType.INITIAL) {
			// If we're already in error state, just provide existing elements
			if (this.#initialEl) {
				return {
					initialEl: this.#initialEl,
				};
			}
		}

		// Start by clearing things out
		this.#clearMarkup();

		this.#initialEl = createElement('span', {
			className: 'task-link task-link--initial',
		});

		this.append(this.#initialEl);

		return {
			initialEl: this.#initialEl,
		};
	}

	#applyInitialContent(
		_elements: TaskLinkStateElements[typeof AsyncActionStateType.INITIAL],
		_oldBuildState: AsyncActionState<[Task, Status]> | null,
		_newBuildState: Extract<
			AsyncActionState<[Task, Status]>,
			{ type: typeof AsyncActionStateType.INITIAL; }
		> | null,
	): void {
		// No initial content necessary
	}

	#buildErrorMarkup(
		oldBuildState: AsyncActionState<[Task, Status]> | null,
	): {
		errorEl: HTMLElement;
	} {
		if (oldBuildState?.type === AsyncActionStateType.ERROR) {
			// If we're already in error state, just provide existing elements
			if (this.#errorEl) {
				return {
					errorEl: this.#errorEl,
				};
			}
		}

		// Start by clearing things out
		this.#clearMarkup();

		// Then construct the DOM
		this.#errorEl = createElement('span', {
			className: 'task-link task-link--invalid',
		});

		this.append(this.#errorEl);

		return {
			errorEl: this.#errorEl,
		};
	}

	#applyErrorContent(
		elements: TaskLinkStateElements[typeof AsyncActionStateType.ERROR],
		oldBuildState: AsyncActionState<[Task, Status]> | null,
		newBuildState: Extract<
			AsyncActionState<[Task, Status]>,
			{ type: typeof AsyncActionStateType.ERROR; }
		>
	) {
		if (!(
			oldBuildState?.type === AsyncActionStateType.ERROR &&
			newBuildState.error.message === oldBuildState.error.message
		)) {
			elements.errorEl.textContent = newBuildState.error.message;
		}
	}

	#buildSuccessMarkup(
		oldBuildState: AsyncActionState<[Task, Status]> | null,
	): TaskLinkStateElements[typeof AsyncActionStateType.SUCCESS] {
		if (oldBuildState?.type === AsyncActionStateType.SUCCESS) {
			// If we're already in success state, just provide existing elements
			if (
				this.#iconEl &&
				this.#linkEl &&
				this.#nameEl
			) {
				return {
					iconEl: this.#iconEl,
					linkEl: this.#linkEl,
					nameEl: this.#nameEl,
				};
			}
		}

		// Start by clearing things out
		this.#clearMarkup();

		// Then construct the DOM
		this.#linkEl = createElement('a', {
			className: 'task-link',
		});
		this.#iconEl = createElement('span', {
			className: 'icon task-link__status',
		});
		this.#iconMaskEl = createElement('span', {
			className: 'icon__mask',
		});
		this.#nameEl = createElement('span', {
			className: 'task-link__name',
		});

		this.append(this.#linkEl);
		this.#linkEl.append(this.#iconEl);
		this.#iconEl.append(this.#iconMaskEl);
		this.#linkEl.append(this.#nameEl);

		return {
			iconEl: this.#iconEl,
			linkEl: this.#linkEl,
			nameEl: this.#nameEl,
		};
	}

	#applySuccessContent(
		elements: TaskLinkStateElements[typeof AsyncActionStateType.SUCCESS],
		oldBuildState: AsyncActionState<[Task, Status]> | null,
		newBuildState: Extract<
			AsyncActionState<[Task, Status]>,
			{ type: typeof AsyncActionStateType.SUCCESS; }
		>
	): void {
		const [task, status] = newBuildState.data;
		const {
			iconEl,
			linkEl,
			nameEl,
		} = elements;

		// Icon
		if (!(
			oldBuildState?.type === AsyncActionStateType.SUCCESS &&
			oldBuildState.data[1].colour === status.colour &&
			oldBuildState.data[1].icon === status.icon &&
			oldBuildState.data[1].name === status.name
		)) {
			iconEl.style.setProperty('--colour', status.colour);
			linkEl.style.setProperty('--icon', status.icon);
			iconEl.setAttribute('title', status.name);
		}

		// Link
		if (!(
			oldBuildState?.type === AsyncActionStateType.SUCCESS &&
			oldBuildState.data[0].id === task.id
		)) {
			linkEl.href = getTaskDetailUrl(task.id);
		}

		// Name
		if (!(
			oldBuildState?.type === AsyncActionStateType.SUCCESS &&
			oldBuildState.data[0].name === task.name
		)) {
			renderInline(task.name).then((taskName) => {
				if (nameEl.setHTML) {
					nameEl.setHTML(taskName, { sanitizer: getSanitiser() });
				} else {
					// This should still be safe, since `renderInline` replaces `'<'` with `'&lt;'`, but still better to use the HTML Sanitizer API where possible
					// This still exists because, as of 2026-10-24, Safari has not shipped Element.setHTML
					nameEl.setHTMLUnsafe(taskName);
				}
			});
		}
	}

	#clearMarkup(): void {
		this.#initialEl = null;
		this.#errorEl = null;
		this.#linkEl = null;
		this.#iconEl = null;
		this.#iconMaskEl = null;
		this.#nameEl = null;

		if (this.firstChild) {
			this.removeChild(this.firstChild);
		}
	}
}
