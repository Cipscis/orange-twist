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
	let previousTime = performance.now();
	const frame = (time: number) => {
		if (options?.signal?.aborted) {
			return;
		}

		const dt = time - previousTime;
		previousTime = time;
		if (dt > 0) {
			/*
			TODO: Not sure why `frame` sometimes gets called with the same timestamp,
			but we skip the frame when that happens to avoid any weirdness
			*/
			callback(dt);
		}
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}
