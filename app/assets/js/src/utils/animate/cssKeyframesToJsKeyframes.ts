/**
 * Convert a string to a number, if possible, otherwise return the string.
 */
function getTypedValue(value: string): string | number {
	const numValue = Number(value);
	if (!isNaN(numValue)) {
		return numValue;
	}
	return value;
}

/**
 * Convert an array-like `CSSStyleDeclaration` into an easier to
 * work with regular object that can be used as part of a `Keyframe`.
 */
function cssStyleDeclarationToObject(style: CSSStyleDeclaration): Record<string, string | number> {
	const entries: [string, string | number][] = [];

	const stylesLength = style.length;
	for (let i = 0; i < stylesLength; i++) {
		const property = style.item(i);
		const value = getTypedValue(
			style.getPropertyValue(property)
		);
		// Ignore property priority

		entries.push([property, value]);
	}

	return Object.fromEntries(entries);
}

/**
 * Convert a CSS keyframe's offset string, e.g. "50%", into a number
 * in the 0-1 range that can be used as the `offset` property of a
 * JS keyframe.
 */
function getCssKeyframeOffset(cssKeyframe: CSSKeyframeRule): number {
	const keytextNumber = Number(cssKeyframe.keyText.replace(/%$/, '')) / 100;
	return keytextNumber;
}

/**
 * Converts a `CSSKeyframeRule` to a `Keyframe` object that can be
 * used with `Element.animate`.
 */
function cssKeyframeRuleToKeyframe(cssKeyframe: CSSKeyframeRule): Keyframe {
	const cleanKeyframeStyles = cssStyleDeclarationToObject(cssKeyframe.style);
	const keyTextNumber = getCssKeyframeOffset(cssKeyframe);

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
