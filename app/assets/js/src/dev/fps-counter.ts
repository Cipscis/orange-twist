import {
	createElement,
	startAnimationLoop,
} from 'utils';

/**
 * A custom element for displaying frames per second information.
 */
export class FpsCounter extends HTMLElement {
	#initialised: boolean;

	#rootEl: HTMLElement | null;
	#fpsTextLowestEl: HTMLElement | null;
	#fpsTextMeanEl: HTMLElement | null;
	#fpsTextCurrentEl: HTMLElement | null;
	#canvas: HTMLCanvasElement | null;

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
		this.#canvas = null;

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

		this.#rootEl = createElement(
			'div',
			{
				className: 'fps',
			}
		);
		shadowRoot.append(this.#rootEl);

		const style = createElement(
			'link',
			{
				rel: 'stylesheet',
				href: '/assets/css/fps.css',
			}
		);
		shadowRoot.append(style);

		this.#fpsTextLowestEl = createElement(
			'span',
			{
				className: 'fps__number fps__lowest',
				innerText: '-',
			}
		);
		this.#fpsTextMeanEl = createElement(
			'span',
			{
				className: 'fps__number fps__mean',
				innerText: '-',
			}
		);
		this.#fpsTextCurrentEl = createElement(
			'span',
			{
				className: 'fps__number fps__current',
				innerText: '-',
			}
		);

		const canvasContainer = createElement(
			'div',
			{
				className: 'fps__canvas-container',
			}
		);

		this.#canvas = createElement(
			'canvas',
			{
				className: 'fps__canvas',
				width: 120,
				height: 1,
			}
		);
		canvasContainer.append(this.#canvas);

		this.#rootEl.append(
			this.#fpsTextLowestEl,
			this.#fpsTextMeanEl,
			this.#fpsTextCurrentEl,
			canvasContainer
		);
	}

	/**
	 * Record and display FPS information each frame until aborted.
	 */
	#displayFps(dt: number): void {
		if (
			this.#displayFpsAbortController?.signal.aborted ||
			!(
				this.#rootEl &&
				this.#fpsTextCurrentEl &&
				this.#fpsTextMeanEl &&
				this.#fpsTextLowestEl &&
				this.#canvas
			)
		) {
			return;
		}

		const fps = Math.round(1000 / dt);
		if (fps <= 0) {
			// Assume this means the tab was inactive, so skip this frame
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

		const context = this.#canvas.getContext('2d');
		if (context) {
			// Move the existing image data one pixel to the left
			const imageData = context.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
			context.putImageData(imageData, -1, 0);

			// Draw one new pixel on the right
			const frameColour = (() => {
				if (fps > 30) {
					return '#006600';
				} else if (fps > 15) {
					return '#ffff00';
				} else {
					return '#ff0000';
				}
			})();
			context.fillStyle = frameColour;
			context.fillRect(this.#canvas.width - 1, 0, 1, this.#canvas.height);
		}
	}

	connectedCallback(): void {
		this.#constructMarkup();

		this.#displayFpsAbortController = new AbortController();
		const { signal } = this.#displayFpsAbortController;

		this.#fpsLog = [];
		this.#previousTime = performance.now();

		startAnimationLoop(this.#displayFps.bind(this), { signal });
	}

	disconnectedCallback(): void {
		if (this.#displayFpsAbortController !== null) {
			this.#displayFpsAbortController.abort();
		}
	}
}
