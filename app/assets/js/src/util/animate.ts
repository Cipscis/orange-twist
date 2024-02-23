import { CSSKeyframes } from './CSSKeyframes';
import { nextFrame } from './nextFrame';

/**
 * Start an animation by specifying a named CSS animation defined
 * in CSS using `@keyframes`, and made available in JavaScript via
 * {@linkcode CSSKeyframes}.
 *
 * Will return `null` if the element is not animating, for example
 * if it has been removed from the DOM.
 */
export function animate(element: HTMLElement, keyframesName: CSSKeyframes): Promise<void> {
	return new Promise((resolve) => {
		const initialAnimationName = element.style.animationName;
		element.style.animationName = keyframesName;
		// TODO: Currently this relies on an element having an existing animation duration. We should set one if it's not already set
		// Wait for the next frame to ensure the animation has been added
		nextFrame().then(() => {
			// Assume that the newest animation is the one we just set in motion
			const animations = element.getAnimations();
			const newestAnimation = animations[animations.length - 1] ?? null;

			// If there's no animation, resolve immediately
			if (!newestAnimation) {
				element.style.animationName = initialAnimationName;
				resolve();
				return;
			}

			// If there is an animation, resolve when it finishes
			newestAnimation.finished.then(() => {
				element.style.animationName = initialAnimationName;
				resolve();
			});
		});
	});
}
