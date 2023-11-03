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
export async function animate(element: HTMLElement, keyframesName: CSSKeyframes): Promise<Animation | null> {
	element.style.animationName = keyframesName;
	// TODO: Currently this relies on an element having an existing animation duration. We should set one if it's not already set
	await nextFrame();

	// Assume that the newest animation is the one we just set in motion
	const animations = element.getAnimations();
	const newestAnimation = animations[animations.length - 1] ?? null;

	return newestAnimation;
}
