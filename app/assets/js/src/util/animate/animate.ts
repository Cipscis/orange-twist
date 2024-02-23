import { CSSKeyframes } from '../CSSKeyframes';
import { getAllKeyframesRules } from './getAllKeyframesRules';
import { getElementAnimationDuration } from './getElementAnimationDuration';

/**
 * Start an animation by specifying a named CSS animation defined
 * in CSS using `@keyframes`, and made available in JavaScript via
 * {@linkcode CSSKeyframes}.
 *
 * If no animation can be found, an empty `Animation` that is
 * already finished will be returned.
 */
export function animate(
	element: HTMLElement,
	keyframesName: CSSKeyframes,
	options?: number | KeyframeAnimationOptions,
): Animation {
	const rules = getAllKeyframesRules();
	const keyframes = rules.get(keyframesName);

	if (!keyframes) {
		const animation = new Animation(null);
		animation.finish();
		return animation;
	}

	// Try to use the animation duration specified in CSS by default
	if (typeof options === 'undefined') {
		options = getElementAnimationDuration(element) ?? 0;
	}

	const animation = element.animate(keyframes, options);
	return animation;
}
