interface StartOptions {
	signal?: AbortSignal;
}

/**
 * Start an animation loop using `requestAnimationFrame` that
 * can be aborted via an `AbortSignal`.
 */
export function startAnimationLoop(
	callback: (dt: number) => void,
	options?: StartOptions
): void {
	let animationFrame: number;
	let previousTime = performance.now();

	if (options?.signal) {
		// Don't even start if passed an already aborted signal
		if (options.signal.aborted) {
			return;
		}

		// Cancel the next frame when the signal is aborted
		options.signal.addEventListener(
			'abort',
			() => cancelAnimationFrame(animationFrame)
		);
	}

	const frame = (time: number) => {
		const dt = time - previousTime;
		previousTime = time;
		if (dt > 0) {
			/*
			TODO: Not sure why `frame` sometimes gets called with the same timestamp,
			but we skip the frame when that happens to avoid any weirdness
			*/
			callback(dt);
		}
		animationFrame = requestAnimationFrame(frame);
	};
	animationFrame = requestAnimationFrame(frame);
}
