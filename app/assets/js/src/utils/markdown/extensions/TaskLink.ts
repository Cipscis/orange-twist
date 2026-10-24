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

type TaskLinkStateElements = {
	[AsyncDataStateType.INITIAL]: {
		initialEl: HTMLElement;
	};
	[AsyncDataStateType.ERROR]: {
		errorEl: HTMLElement;
	};
	[AsyncDataStateType.SUCCESS]: {
		iconEl: HTMLElement;
		linkEl: HTMLAnchorElement;
		nameEl: HTMLElement;
	};
};

/**
 * A link to a task that displays a live view of its status and name.
 */
export class TaskLink extends HTMLElement {
	static observedAttributes = ['taskid'];

	// Internal state
	#lastBuildState: AsyncDataState<[Task, Status]> | null = null;

	// LiveData properties
	#liveTaskWithStatus: LiveTaskWithStatus | null = null;

	// Internal markup
	#initialEl: HTMLElement | null = null;
	#errorEl: HTMLElement | null = null;
	#linkEl: HTMLAnchorElement | null = null;
	#iconEl: HTMLElement | null = null;
	#iconMaskEl: HTMLElement | null = null;
	#nameEl: HTMLElement | null = null;

	// AbortControllers
	#connectedAbortController: AbortController | null = null;
	#taskIdChangeAbortController: AbortController | null = null;

	constructor() {
		super();

		const taskIdAttribute = this.getAttribute('taskid');
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
		if (name !== 'taskid') {
			return;
		}

		const taskId = this.#parseTaskId(newValue);
		this.#setTaskId(taskId);
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

	/**
	 * Configure the internal `LiveTaskWithStatus` with a given task ID
	 */
	#setTaskId(taskId: number | null): void {
		if (this.#taskIdChangeAbortController) {
			this.#taskIdChangeAbortController.abort();
			this.#taskIdChangeAbortController = null;
		}

		if (taskId === null) {
			this.#liveTaskWithStatus = null;
			this.#render();
			return;
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

		this.#liveTaskWithStatus.addEventListener('loadstart', () => this.#render());
		this.#liveTaskWithStatus.addEventListener('loadend', () => this.#render());

		this.#liveTaskWithStatus.observe({ signal });
	}

	#render(): void {
		const oldBuildState = this.#lastBuildState;
		const newBuildState = this.#liveTaskWithStatus?.state ?? {
			type: AsyncDataStateType.ERROR,
			error: new Error('No valid taskid attribute was found'),
			loading: false,
		};

		this.#lastBuildState = newBuildState;

		if (newBuildState.type === AsyncDataStateType.INITIAL) {
			const elements = this.#buildInitialMarkup(oldBuildState);
			this.#applyInitialContent(elements, oldBuildState, newBuildState);
		} else if (newBuildState.type === AsyncDataStateType.ERROR) {
			const elements = this.#buildErrorMarkup(oldBuildState);
			this.#applyErrorContent(elements, oldBuildState, newBuildState);
		} else if (newBuildState.type === AsyncDataStateType.SUCCESS) {
			const elements = this.#buildSuccessMarkup(oldBuildState);
			this.#applySuccessContent(elements, oldBuildState, newBuildState);
		} else {
			assertAllUnionMembersHandled(newBuildState);
		}
	}

	#buildInitialMarkup(
		oldBuildState: AsyncDataState<[Task, Status]> | null,
	): TaskLinkStateElements[typeof AsyncDataStateType.INITIAL] {
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

	#applyInitialContent(
		_elements: TaskLinkStateElements[typeof AsyncDataStateType.INITIAL],
		_oldBuildState: AsyncDataState<[Task, Status]> | null,
		_newBuildState: Extract<
			AsyncDataState<[Task, Status]>,
			{ type: typeof AsyncDataStateType.INITIAL; }
		> | null,
	): void {
		// No initial content necessary
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

	#applyErrorContent(
		elements: TaskLinkStateElements[typeof AsyncDataStateType.ERROR],
		oldBuildState: AsyncDataState<[Task, Status]> | null,
		newBuildState: Extract<
			AsyncDataState<[Task, Status]>,
			{ type: typeof AsyncDataStateType.ERROR; }
		>
	) {
		if (
			oldBuildState?.type !== AsyncDataStateType.ERROR ||
			newBuildState.error.message !== oldBuildState.error.message
		) {
			elements.errorEl.textContent = newBuildState.error.message;
		}
	}

	#buildSuccessMarkup(
		oldBuildState: AsyncDataState<[Task, Status]> | null,
	): TaskLinkStateElements[typeof AsyncDataStateType.SUCCESS] {
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
		elements: TaskLinkStateElements[typeof AsyncDataStateType.SUCCESS],
		oldBuildState: AsyncDataState<[Task, Status]> | null,
		newBuildState: Extract<
			AsyncDataState<[Task, Status]>,
			{ type: typeof AsyncDataStateType.SUCCESS; }
		>
	): void {
		const [task, status] = newBuildState.data;
		const {
			iconEl,
			linkEl,
			nameEl,
		} = elements;

		// Icon
		if (
			oldBuildState?.type !== AsyncDataStateType.SUCCESS ||
			oldBuildState.data[1].colour !== status.colour ||
			oldBuildState.data[1].icon !== status.icon ||
			oldBuildState.data[1].name !== status.name
		) {
			iconEl.style.setProperty('--colour', status.colour);
			linkEl.style.setProperty('--icon', status.icon);
			iconEl.setAttribute('title', status.name);
		}

		// Link
		if (
			oldBuildState?.type !== AsyncDataStateType.SUCCESS ||
			oldBuildState.data[0].id !== task.id
		) {
			linkEl.href = getTaskDetailUrl(task.id);
		}

		// Name
		if (
			oldBuildState?.type !== AsyncDataStateType.SUCCESS ||
			oldBuildState.data[0].name !== task.name
		) {
			// TODO: This step should be standardised somehow
			const safeTaskName = task.name.replace(/</g, '&lt;');
			const parseResult = Promise.try(
				() => marked.parse(safeTaskName, { breaks: true })
			);

			parseResult.then((taskName) => {
				// TODO: This step should be standardised somehow
				const inlineTaskName = taskName.replace(/<p>(.+)<\/p>\n?/, '$1');

				// TODO: Is there a safer way to set this as HTML? Chromium and Firefox have shipped the HTML Sanitizer API, but Safari hasn't
				// if (nameEl.setHTML) {
				// 	nameEl.setHTML(rawTaskName);
				// } else {
				nameEl.setHTMLUnsafe(inlineTaskName);
				// }
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
