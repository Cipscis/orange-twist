/**
 * Utility type for manually creating objects like TypeScript enums, without using TypeScript's `enum` keyword.
 *
 * This allows us to avoid the potential pitfalls of TypeScript enums,
 * such as number enums having more keys than you might expect,
 * as well as making the JavaScript output clearer.
 *
 * The downside is that we have to make the type ourselves in order to use it like a true `enum`.
 *
 * @example
 * ```typescript
 * const MyEnum = {
 * 	KEY: 'value',
 * 	SECOND_KEY: 'other value',
 * } as const;
 * type MyEnum = EnumTypeOf<typeof MyEnum>; // 'value' | 'other value'
 * ```
 */
export type EnumTypeOf<E> = E[keyof E];
