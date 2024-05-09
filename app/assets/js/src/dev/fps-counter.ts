/**
 * A custom element for displaying frames per second information.
 */
export class FpsCounter extends HTMLElement {
	#initialised: boolean;

	#rootEl: HTMLElement | null;
	#fpsTextLowestEl: HTMLElement | null;
	#fpsTextMeanEl: HTMLElement | null;
	#fpsTextCurrentEl: HTMLElement | null;

	#displayFpsAbortController: AbortController | null;

	#fpsLog: number[];
	#previousTime: number;

	constructor() {
		super();

		this.#initialised = false;

		this.#rootEl = null;
		this.#fpsTextCurrentEl = null;
		this.#fpsTextMeanEl = null;
		this.#fpsTextLowestEl = null;

		this.#displayFpsAbortController = null;

		this.#fpsLog = [];
		this.#previousTime = 0;
	}

	/**
	 * Construct internal markup just once.
	 */
	#constructMarkup(): void {
		if (this.#initialised) {
			return;
		}
		this.#initialised = true;

		const shadowRoot = this.attachShadow({ mode: 'open' });

		this.#rootEl = Object.assign(
			document.createElement('div'),
			{
				className: 'fps',
			}
		);
		shadowRoot.append(this.#rootEl);

		const style = Object.assign(
			document.createElement('link'),
			{
				rel: 'stylesheet',
				href: '/assets/css/fps.css',
			}
		);
		shadowRoot.append(style);

		this.#fpsTextLowestEl = Object.assign(
			document.createElement('span'),
			{
				className: 'fps__number fps__lowest',
				innerText: '-',
			} satisfies Partial<HTMLSpanElement>
		);
		this.#fpsTextMeanEl = Object.assign(
			document.createElement('span'),
			{
				className: 'fps__number fps__mean',
				innerText: '-',
			} satisfies Partial<HTMLSpanElement>
		);
		this.#fpsTextCurrentEl = Object.assign(
			document.createElement('span'),
			{
				className: 'fps__number fps__current',
				innerText: '-',
			} satisfies Partial<HTMLSpanElement>
		);
		this.#rootEl.append(this.#fpsTextLowestEl, this.#fpsTextMeanEl, this.#fpsTextCurrentEl);
	}

	/**
	 * Record and display FPS information each frame until aborted.
	 */
	#displayFps(time: number): void {
		if (
			this.#displayFpsAbortController?.signal.aborted ||
			!(
				this.#rootEl &&
				this.#fpsTextCurrentEl &&
				this.#fpsTextMeanEl &&
				this.#fpsTextLowestEl
			)
		) {
			return;
		}

		const dt = time - this.#previousTime;
		this.#previousTime = time;

		const fps = Math.floor(1000 / dt);
		if (fps <= 0) {
			// Assume this means the tab was inactive, so skip this frame
			requestAnimationFrame((time) => this.#displayFps(time));
			return;
		}

		this.#fpsLog.push(fps);
		if (this.#fpsLog.length > 120) {
			this.#fpsLog.shift();
		}

		const fpsLowest = Math.min(...this.#fpsLog);
		const fpsLowestString = String(fpsLowest);
		if (this.#fpsTextLowestEl.innerText !== fpsLowestString) {
			this.#fpsTextLowestEl.innerText = fpsLowestString;
		}

		let fpsTotal = 0;
		for (const frameTime of this.#fpsLog) {
			fpsTotal += frameTime;
		}
		const fpsMean = Math.round(fpsTotal / this.#fpsLog.length);
		const fpsMeanString = String(fpsMean);
		if (this.#fpsTextMeanEl.innerText !== fpsMeanString) {
			this.#fpsTextMeanEl.innerText = fpsMeanString;
		}

		const fpsCurrentString = String(fps);
		if (this.#fpsTextCurrentEl.innerText !== fpsCurrentString) {
			this.#fpsTextCurrentEl.innerText = fpsCurrentString;
		}

		const isLowFps = fpsLowest < 30;
		this.#rootEl.classList.toggle('fps--low', isLowFps);

		requestAnimationFrame((time) => this.#displayFps(time));
	}

	connectedCallback(): void {
		this.#constructMarkup();

		this.#displayFpsAbortController = new AbortController();

		this.#fpsLog = [];
		this.#previousTime = performance.now();

		requestAnimationFrame((time) => this.#displayFps(time));
	}

	disconnectedCallback(): void {
		if (this.#displayFpsAbortController !== null) {
			this.#displayFpsAbortController.abort();
		}
	}
}
