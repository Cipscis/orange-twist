/**
 * A nested variant of {@linkcode Partial}, which recursively
 * makes properties in any nested objects also optional.
 *
 * @example
 * ```typescript
 * type Foo = DeepPartial<{
 *     bar: {
 *         foobar: boolean;
 *     };
 * }>;
 * // Becomes...
 * type Foo = {
 *     bar?: {
 *         foobar?: boolean | undefined;
 *     } | undefined
 * }
 * ```
 */
export type DeepPartial<T> = T extends object ? {
	[P in keyof T]?:
		T[P] extends Array<infer Inner>
		? Array<DeepPartial<Inner>> :
		T[P] extends ReadonlyArray<infer Inner>
		? ReadonlyArray<DeepPartial<Inner>> :
		DeepPartial<T[P]>;
} : T;
