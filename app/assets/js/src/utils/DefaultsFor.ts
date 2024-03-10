/**
 * Extract the optional keys of a type.
 *
 * @see {@link https://stackoverflow.com/a/52991061/1710523 StackOverflow answer}
 */
type OptionalKeys<T> = {
	[K in keyof T]-?: {} extends Pick<T, K>
		? K
		: never;
}[keyof T];

/**
 * Constructs a type that contains all optional keys of the generic
 * type as required keys. This type is intended to use when constructing
 * a "defaults" object to fill in any blanks from an object with
 * some optional keys
 *
 * @example
 * ```typescript
 * interface MyFnOptions {
 * 	type?: 'primary' | 'secondary';
 * 	title: string;
 * }
 *
 * // Constructing a defaults object using `DefaultsFor`
 * const defaults = {
 * 	type: 'primary',
 * } as const satisfies DefaultsFor<MyFnOptions>;
 *
 * function myFn(options: MyFnOptions) {
 * 	// Combining with defaults
 * 	const fullOptions = {
 * 		...defaults,
 * 		...options,
 * 	}; // <- Required<MyFnOptions>
 *
 * 	// ...
 * ```
 */
export type DefaultsFor<T> = Required<Pick<T, OptionalKeys<T>>>;
