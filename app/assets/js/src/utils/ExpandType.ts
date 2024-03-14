/**
 * This utility type forces TypeScript to fully expand the
 * type definition within tooltips, rather than providing
 * a collapsed view that uses type names.
 *
 * @see [The `Prettify` Helper](https://www.totaltypescript.com/concepts/the-prettify-helper)
 *
 * @example
 * ```typescript
 * type Example = {
 *     foo: string;
 * } & (
 *     {
 *         bar: number;
 *     } |
 *     {
 *         foobar: boolean;
 *     }
 * );
 *
 * type ExpandedExample = ExpandType<Example>;
 * // {
 * //     foo: string;
 * //     bar: number;
 * // } | {
 * //     foo: string;
 * //     foobar: boolean;
 * // }
 * ```
 */
export type ExpandType<T> = {
	[K in keyof T]: T[K];
} & {};
