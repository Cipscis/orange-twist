import { marked } from 'marked';

import { createElement } from 'utils';
import { getTaskDetailUrl } from 'navigation';
import {
	LiveStatusForTask,
	LiveTask,
} from 'database';

/**
 * A link to a task that displays a live view of its status and name.
 */
export class TaskLink extends HTMLElement {
	static observedAttributes = ['task-id'];

	#initialised: boolean = false;

	#taskId: number | null = null;

	#liveTask: LiveTask | null = null;
	#liveTaskStatus: LiveStatusForTask | null = null;

	#linkEl: HTMLElement | null = null;
	#iconEl: HTMLElement | null = null;
	#iconMaskEl: HTMLElement | null = null;
	#nameEl: HTMLElement | null = null;

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

		this.#liveTask = new LiveTask(taskId);
		this.#liveTaskStatus = new LiveStatusForTask(taskId);

		this.#observe();
	}

	/**
	 * If our live data exists, and we're connected to the DOM, start observing that live data.
	 */
	#observe(): void {
		if (!(
			this.#connectedAbortController &&
			this.#taskIdChangeAbortController &&
			this.#liveTask &&
			this.#liveTaskStatus
		)) {
			return;
		}

		const self = this;

		const signal = AbortSignal.any([
			this.#connectedAbortController.signal,
			this.#taskIdChangeAbortController.signal,
		]);

		this.#liveTask.observe({ signal });
		this.#liveTaskStatus.observe({ signal });

		this.#liveTask.addEventListener('load', async function () {
			const taskName = (await Promise.try(() =>
				marked.parse(this.state.data.name, {
					breaks: true,
				}))).replace(/<p>(.+)<\/p>\n?/, '$1');
			// TODO: What to do about this non-null assertion?
			// TODO: Is there a safer way to set this as HTML? Chromium and Firefox have shipped the HTML Sanitization API, but Safari hasn't
			self.#nameEl!.innerHTML = taskName;
		}, { signal });

		// TODO: Handle task error state

		this.#liveTaskStatus.addEventListener('load', function () {
			const status = this.state.data;

			// TODO: What to do about this non-null assertion?
			self.#iconEl!.style.setProperty('--colour', status.colour);
			self.#linkEl!.style.setProperty('--icon', status.icon);
			self.#iconEl!.setAttribute('title', status.name);
		}, { signal });

		// TODO: Handle task status error state
	}

	#constructMarkup(): void {
		if (this.#initialised) {
			return;
		}
		this.#initialised = true;

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

		// TODO: How to represent initial state

		this.append(this.#linkEl);
		this.#linkEl.append(this.#iconEl);
		this.#iconEl.append(this.#iconMaskEl);
		this.#linkEl.append(this.#nameEl);
	}
}
