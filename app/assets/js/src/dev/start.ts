interface StartOptions {
	signal?: AbortSignal;
}

/**
 * Start an animation loop using `requestAnimationFrame` that can be aborted via
 * an `AbortSignal`.
 */
export function start(callback: (dt: number) => void, options?: StartOptions): void {
	let previousTime = performance.now();
	const frame = (time: number) => {
		if (options?.signal?.aborted) {
			return;
		}

		const dt = time - previousTime;
		previousTime = time;
		// TODO: Not sure why this sometimes happens, but we skip the frame anyway
		if (dt > 0) {
			callback(dt);
		}
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}
