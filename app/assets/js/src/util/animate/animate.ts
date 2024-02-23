import type { StringWithAutocomplete } from 'util/index';

import { type CSSKeyframes } from '../CSSKeyframes';
import { getAllKeyframesRules } from './getAllKeyframesRules';
import { getElementAnimationDuration } from './getElementAnimationDuration';

/**
 * Start an animation by specifying a named CSS animation defined
 * in CSS using `@keyframes`.
 *
 * If no keyframes can be found, an empty `Animation` will be used.
 *
 * @see {@linkcode CSSKeyframes} for a list of named CSS animations.
 */
export function animate(
	element: HTMLElement,
	keyframesName: StringWithAutocomplete<CSSKeyframes>,
	options?: number | KeyframeAnimationOptions,
): Animation {
	const rules = getAllKeyframesRules();
	const keyframes = rules.get(keyframesName) ?? null;

	// Try to use the animation duration specified in CSS by default
	if (typeof options === 'undefined') {
		const cssAnimationDuration = getElementAnimationDuration(element);
		if (cssAnimationDuration !== null) {
			options = cssAnimationDuration;
		}
	}

	const animation = element.animate(keyframes, options);
	return animation;
}
