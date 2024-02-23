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
 * If no duration is specified, but an animation duration is specified
 * in CSS, that CSS duration will be used instead if possible.
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
	if (
		typeof options === 'undefined' ||
		(
			typeof options === 'object' &&
			typeof options.duration === 'undefined'
		)
	) {
		const cssAnimationDuration = getElementAnimationDuration(element);
		if (cssAnimationDuration !== null) {
			options = options ?? {};
			options.duration = cssAnimationDuration;
		}
	}

	const animation = element.animate(keyframes, options);
	return animation;
}
