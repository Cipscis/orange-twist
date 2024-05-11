import { cssKeyframesRuleToKeyframes } from './cssKeyframesToJsKeyframes';

/**
 * Recursively flatten a `CSSGroupingRule` object into all its
 * constituent rules, or return a non-grouping `CSSRule` directly.
 *
 * Designed for use with `Array.flatMap`.
 */
function extractGroupedRules(rule: CSSRule): CSSRule | CSSRule[] {
	if (rule instanceof CSSGroupingRule) {
		return Array.from(rule.cssRules).flatMap(extractGroupedRules);
	} else {
		return rule;
	}
}

/**
 * Gets all `CSSKeyframesRule` objects from loaded stylesheets,
 * including those defined at the top level and those defined
 * within grouping rules such as `@layer` rules.
 */
export function getAllKeyframesRules(): Map<string, Keyframe[]> {
	const keyframes = new Map<string, Keyframe[]>();

	const origin = document.location.origin;

	/** All CSS rules from all stylesheets. */
	const rules = Array.from(document.styleSheets)
		.filter(
			// Ignore cross-origin stylesheets
			(stylesheet) => stylesheet.href && new URL(stylesheet.href).origin === origin
		)
		.flatMap(
			({ cssRules }) => Array.from(cssRules)
				.flatMap(extractGroupedRules)
		);

	for (const rule of rules) {
		if (rule instanceof CSSKeyframesRule) {
			keyframes.set(rule.name, cssKeyframesRuleToKeyframes(rule));
		}
	}

	return keyframes;
}
