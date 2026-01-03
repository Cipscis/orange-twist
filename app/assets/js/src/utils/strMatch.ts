import type { DefaultsFor } from './DefaultsFor';
import { removeDiacritics } from './removeDiacritics';

export interface StrMatchOptions {
	/**
	 * Whether or not the match should ignore case differences, e.g. if "a" should match "A" or not.
	 * @default false
	 */
	ignoreCase?: boolean;

	/**
	 * Whether or not the match should ignore diacritics, e.g. if "a" should match "ā" or not.
	 * @default false
	 */
	ignoreDiacritics?: boolean;
}

const defaultOptions: DefaultsFor<StrMatchOptions> = {
	ignoreCase: false,
	ignoreDiacritics: false,
};

/**
 * Check if a containing string contains a specified query string.
 *
 * @example
 * ```typescript
 * strMatch('this is a test', 'test');
 * // true
 *
 * strMatch('this is a Test', 'test');
 * // false
 *
 * strMatch('this is a Test', 'test', { ignoreCase: true });
 * // true
 */
export function strMatch(
	containingString: string,
	queryString: string,
	options?: StrMatchOptions,
): boolean {
	const [container, query] = applyStrMatchOptions(
		containingString,
		queryString,
		{ ...defaultOptions, ...options },
	);

	return container.includes(query);
}

function applyStrMatchOptions(
	containingString: string,
	queryString: string,
	options: Required<StrMatchOptions>,
): [
	modifiedContainingString: string,
	modifiedQueryString: string
] {
	const {
		ignoreCase,
		ignoreDiacritics,
	} = options;

	let container = containingString;
	let query = queryString;

	if (ignoreCase) {
		container = container.toLocaleLowerCase();
		query = query.toLocaleLowerCase();
	}

	if (ignoreDiacritics) {
		container = removeDiacritics(container);
		query = removeDiacritics(query);
	}

	return [container, query];
}
