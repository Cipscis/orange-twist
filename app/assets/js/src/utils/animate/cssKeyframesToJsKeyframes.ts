/**
 * Converts a `CSSKeyframeRule` to a `Keyframe` object that can be
 * used with `Element.animate`.
 */
function cssKeyframeRuleToKeyframe(cssKeyframe: CSSKeyframeRule): Keyframe {
	// Use destructuring and spread syntax to remove unwanted properties
	const {
		parentRule,
		getPropertyPriority, /* eslint-disable-line @typescript-eslint/unbound-method */
		getPropertyValue, /* eslint-disable-line @typescript-eslint/unbound-method */
		item, /* eslint-disable-line @typescript-eslint/unbound-method */
		removeProperty, /* eslint-disable-line @typescript-eslint/unbound-method */
		setProperty, /* eslint-disable-line @typescript-eslint/unbound-method */
		[Symbol.iterator]: _ignore,

		...keyframeStyles
	} = cssKeyframe.style;

	// Remove further unwanted properties, and clean some others
	const cleanKeyframeStyles = Object.fromEntries(
		Object.entries(keyframeStyles)
			// Remove empty CSS properties and numeric keys
			.filter(
				([key, value]) => value !== '' && isNaN(Number(key))
			)
			// Convert number values to actual numbers
			.map(
				([key, value]) => {
					if (isNaN(Number(value))) {
						return [key, value];
					}

					return [key, Number(value)];
				}
			)
	);

	/** The `keyText` property of the CSS keyframe,
	 * converted to a number in the 0-1 range so
	 * it can be used as the `offset` propert of
	 * a JS keyframe. */
	const keyTextNumber = Number(cssKeyframe.keyText.replace(/%$/, '')) / 100;

	const jsKeyframe = {
		...cleanKeyframeStyles,
		offset: keyTextNumber,
	};
	return jsKeyframe;
}

/**
 * Converts a `CSSKeyframesRule` object to an array of `Keyframe` objects
 * that can be used with `Element.animate`.
 */
export function cssKeyframesRuleToKeyframes(keyframes: CSSKeyframesRule): Keyframe[] {
	const keyframeRules = Array.from(keyframes.cssRules).filter(
		(rule): rule is CSSKeyframeRule => rule instanceof CSSKeyframeRule
	);

	return keyframeRules.map(cssKeyframeRuleToKeyframe);
}
