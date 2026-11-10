import type { LiveData } from 'utils/asyncData';

/**
 * A generic class to be extended by custom HTML elements driven by {@linkcode LiveData}.
 *
 * It manages automatically observing the `LiveData` when the element is connected to the DOM, and re-rendering the component when the observed data is updated.
 *
 * An extending class is expected to implement:
 *
 * - A static `observedAttributes` property
 * - `attributeChangedCallback` to call `super.attributeChangedCallback()` and `this.setLiveData()`/`this.clearLiveData()`
 * - `render` to call `super.render()` and render the element based on `this.liveData?.state`
 */
export class HTMLLiveDataElement<T> extends HTMLElement {
	#liveData: LiveData<T> | null = null;

	/**
	 * The {@linkcode LiveData} that drives this element. This should be set via {@linkcode HTMLLiveDataElement.setLiveData setLiveData} in {@linkcode HTMLLiveDataElement.attributeChangedCallback attributeChangedCallback}.
	 *
	 * If it cannot be set, for example if an attribute is invalid, it should be cleared with {@linkcode HTMLLiveDataElement.clearLiveData clearLiveData}.
	 */
	get liveData(): LiveData<T> | null {
		return this.#liveData;
	}

	#connectedAbortController: AbortController | null = null;
	#attributeChangeAbortController: AbortController | null = null;

	constructor() {
		super();
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
		_name: string,
		_oldValue: string | null,
		_newValue: string | null,
	): void {
		if (this.#attributeChangeAbortController) {
			this.#attributeChangeAbortController.abort();
			this.#attributeChangeAbortController = null;
		}

		this.#attributeChangeAbortController = new AbortController();
	}

	/**
	 * If our live data exists, and we're connected to the DOM, start observing that live data so this element will re-render each time it changes.
	 */
	#observe(): void {
		if (!(
			this.#connectedAbortController &&
			this.#attributeChangeAbortController &&
			this.#liveData
		)) {
			return;
		}

		const signal = AbortSignal.any([
			this.#connectedAbortController.signal,
			this.#attributeChangeAbortController.signal,
		]);

		const render = () => this.render();
		this.#liveData.addEventListener(
			'loadstart',
			render,
			{ signal },
		);
		this.#liveData.addEventListener(
			'loadend',
			render,
			{ signal },
		);

		this.#liveData.observe({ signal });
	}

	/**
	 * Sets the element's internal {@linkcode LiveData} and begins observing it, ensuring the element will re-render if the data is changed.
	 */
	setLiveData(liveData: LiveData<T>): void {
		this.#liveData = liveData;
		this.#observe();
	}

	/**
	 * Clears this element's {@linkcode LiveData} and re-renders it with the default state.
	 */
	clearLiveData(): void {
		if (this.#liveData) {
			this.#liveData[Symbol.dispose]();
		}
		this.#liveData = null;
		this.render();
	}

	render(): void {
		// This function needs to be fleshed out by the extending class
	}
}
