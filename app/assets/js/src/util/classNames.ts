type ClassNameArg = string | Record<string, unknown> | null | undefined;

/**
 * Consolidate the format of any type of `ClassNameArg`.
 */
function classNamesArgToString(arg: ClassNameArg): string | null {
	if (!arg) {
		return null;
	}

	if (typeof arg === 'string') {
		return arg;
	}

	const classNames = Object.entries(arg)
		.filter(([className, condition]) => condition)
		.map(([className]) => className);

	return classNames.join(' ');
}

/**
 * Easily construct strings for use in `class` HTML attributes.
 *
 * Inspired heavily by the
 * [classnames](https://www.npmjs.com/package/classnames) library, except tiny.
 *
 * @example
 * ```typescript
 * const classString = classnames(
 *     'foo',
 *     {
 *         bar: false,
 *         foobar: true,
 *     }
 * );
 * console.log(classString); // <- 'foo foobar'
 * ```
 *
 * It makes some tradeoffs to keep its size small. For example,
 * any leading or trailing spaces will not be removed.
 */
export function classNames(...args: ClassNameArg[]): string {
	const combinedClasses = args
		.map(classNamesArgToString)
		.filter(Boolean)
		.join(' ');

	const uniqueStringParts = [...new Set(
		combinedClasses.split(' ')
	)];

	return uniqueStringParts.join(' ');
}
