import { CSSKeyframes } from './CSSKeyframes.js';
import { nextFrame } from './nextFrame.js';

/**
 * Start an animation by specifying a named CSS animation defined
 * in CSS using `@keyframes`, and made available in JavaScript via
 * {@linkcode CSSKeyframes}.
 */
export async function animate(element: HTMLElement, keyframesName: CSSKeyframes): Promise<Animation> {
	element.style.animationName = keyframesName;
	// TODO: Currently this relies on an element having an existing animation duration. We should set one if it's not already set
	await nextFrame();

	// Assume that the newest animation is the one we just set in motion
	const animations = element.getAnimations();
	const newestAnimation = animations[animations.length - 1];

	return newestAnimation;
}
