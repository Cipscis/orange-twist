import { marked } from 'marked';

import { assertAllUnionMembersHandled } from 'utils/assertAllUnionMembersHandled';
import { createElement } from 'utils/createElement';
import { AsyncDataStateType, type AsyncDataState } from 'utils/asyncData';

import { getTaskDetailUrl } from 'navigation';
import {
	LiveTaskWithStatus,
	type Status,
	type Task,
} from 'database';

/**
 * A link to a task that displays a live view of its status and name.
 */
export class TaskLink extends HTMLElement {
	static observedAttributes = ['task-id'];

	// Internal state
	#taskId: number | null = null;
	#lastBuildState: AsyncDataState<[Task, Status]> | null = null;

	// LiveData properties
	#liveTaskWithStatus: LiveTaskWithStatus | null = null;

	// Internal markup
	#initialEl: HTMLElement | null = null;
	#errorEl: HTMLElement | null = null;
	#linkEl: HTMLElement | null = null;
	#iconEl: HTMLElement | null = null;
	#iconMaskEl: HTMLElement | null = null;
	#nameEl: HTMLElement | null = null;

	// AbortControllers
	#connectedAbortController: AbortController | null = null;
	#taskIdChangeAbortController: AbortController | null = null;

	constructor() {
		super();

		const taskIdAttribute = this.getAttribute('task-id');
		const taskId = (() => {
			if (taskIdAttribute === null) {
				return null;
			}

			const taskId = parseInt(taskIdAttribute, 10);
			if (isNaN(taskId)) {
				return null;
			}

			return taskId;
		})();
		this.#setTaskId(taskId);
	}

	connectedCallback(): void {
		this.#connectedAbortController = new AbortController();

		this.#constructMarkup();
		this.#observe();
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
		if (name !== 'task-id') {
			return;
		}

		const taskId = this.#parseTaskId(newValue);
		this.#setTaskId(taskId);
	}

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

	#setTaskId(taskId: number | null): void {
		this.#taskId = taskId;

		if (this.#taskIdChangeAbortController) {
			this.#taskIdChangeAbortController.abort();
		}

		if (taskId === null) {
			if (this.#linkEl) {
				this.#linkEl.removeAttribute('href');
			}
			return;
		}

		if (this.#linkEl) {
			this.#linkEl.setAttribute('href', getTaskDetailUrl(taskId));
		}

		this.#taskIdChangeAbortController = new AbortController();

		this.#liveTaskWithStatus = new LiveTaskWithStatus(taskId);

		this.#observe();
	}

	/**
	 * If our live data exists, and we're connected to the DOM, start observing that live data.
	 */
	#observe(): void {
		if (!(
			this.#connectedAbortController &&
			this.#taskIdChangeAbortController &&
			this.#liveTaskWithStatus
		)) {
			return;
		}

		const signal = AbortSignal.any([
			this.#connectedAbortController.signal,
			this.#taskIdChangeAbortController.signal,
		]);

		this.#liveTaskWithStatus.addEventListener('loadstart', () => this.#constructMarkup());
		this.#liveTaskWithStatus.addEventListener('loadend', () => this.#constructMarkup());

		this.#liveTaskWithStatus.observe({ signal });
	}

	#constructMarkup(): void {
		const oldBuildState = this.#lastBuildState;
		const newBuildState = this.#liveTaskWithStatus?.state ?? null;

		this.#lastBuildState = newBuildState;
		if (newBuildState === null) {
			return;
		}

		if (newBuildState.type === AsyncDataStateType.INITIAL) {
			this.#buildInitialMarkup(oldBuildState);
		} else if (newBuildState.type === AsyncDataStateType.ERROR) {
			const {
				errorEl,
			} = this.#buildErrorMarkup(oldBuildState);

			errorEl.textContent = newBuildState.error.message;
		} else if (newBuildState.type === AsyncDataStateType.SUCCESS) {
			const {
				iconEl,
				linkEl,
				nameEl,
			} = this.#buildSuccessMarkup(oldBuildState);
			const [task, status] = newBuildState.data;

			iconEl.style.setProperty('--colour', status.colour);
			linkEl.style.setProperty('--icon', status.icon);
			iconEl.setAttribute('title', status.name);

			Promise.try(() =>
				marked.parse(task.name.replace(/</g, '&lt;'), {
					breaks: true,
				})).then((taskName) => {
				const rawTaskName = taskName
					.replace(/<p>(.+)<\/p>\n?/, '$1');
				// TODO: Is there a safer way to set this as HTML? Chromium and Firefox have shipped the HTML Sanitizer API, but Safari hasn't
				// if (nameEl.setHTML) {
				// 	nameEl.setHTML(rawTaskName);
				// } else {
				nameEl.setHTMLUnsafe(rawTaskName);
				// }
			});
		} else {
			assertAllUnionMembersHandled(newBuildState);
		}
	}

	#buildInitialMarkup(
		oldBuildState: AsyncDataState<[Task, Status]> | null,
	): {
		initialEl: HTMLElement;
	} {
		if (oldBuildState?.type === AsyncDataStateType.INITIAL) {
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

	#buildErrorMarkup(
		oldBuildState: AsyncDataState<[Task, Status]> | null,
	): {
		errorEl: HTMLElement;
	} {
		if (oldBuildState?.type === AsyncDataStateType.ERROR) {
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

	#buildSuccessMarkup(
		oldBuildState: AsyncDataState<[Task, Status]> | null,
	): {
		iconEl: HTMLElement;
		linkEl: HTMLElement;
		nameEl: HTMLElement;
	} {
		if (oldBuildState?.type === AsyncDataStateType.SUCCESS) {
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
			href: this.#taskId === null
				? undefined
				: getTaskDetailUrl(this.#taskId),
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
