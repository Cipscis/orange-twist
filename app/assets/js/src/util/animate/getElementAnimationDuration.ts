/**
 * Gets an element's current animation duration, as milliseconds.
 * If the element doesn't have an animation duration, or if it's not
 * specified in seconds or milliseconds, returns `null` instead.
 */
export function getElementAnimationDuration(element: Element): number | null {
	const duration = getComputedStyle(element).animationDuration;
	let durationNumber: number;

	if (/ms$/.test(duration)) {
		durationNumber = Number(duration.replace(/ms$/, ''));
	} else if (/s$/.test(duration)) {
		durationNumber = Number(duration.replace(/s$/, '')) * 1000;
	} else if (duration === '0') {
		return 0;
	} else {
		return null;
	}

	if (isNaN(durationNumber)) {
		return null;
	}

	return durationNumber;
}
