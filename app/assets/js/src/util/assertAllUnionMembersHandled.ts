/**
 * **Investigating an error?**
 *
 * You probably need to add additional code to handle one or more values of an enum or another union type.
 *
 * You can hover over the argument passed into this function to see the values that aren't handled currently. For example, if you see:
 *
 * ```typescript
 * const foo: "A" | "B";
 * ```
 *
 * That means the union members `'A'` and `'B'` were not handled.
 *
 * ---
 *
 * **Using this function**
 *
 * This function can be used to help ensure TypeScript will throw an error if you fail to handle all cases of a type union, like an enum. It is typically used within a the `default` case of a `switch` block or an `else` block, but can also be used after a series of conditional early returns.
 *
 * It works by providing a single overload that differs from its implementation. In runtime, if this function is called then it will throw a `TypeError`. In your IDE, however, the function's only overload's type will be used. This means if its argument's type is anything other than `never` then TypeScript will throw an error.
 *
 * This takes advantage of how, in certain cases, TypeScript will progressively narrow a value's type. For a type union like an enum, once all possible values have been handled then the remaining type will have been narrowed to `never`, which is essentually an empty union type.
 *
 * By calling this at the point where all possible values should have been handled, we can let TypeScript assure us that all cases have been handled. If a new union member is added, then TypeScript will complain about it being unhandled.
 *
 * @param value This is the value which should have had all potential values handled already by this point.
 * @param getErrorMessage Optionally, you can pass a function to construct a custom error message in the case that this function is ever called. If this is omitted, a default error message will be used instead.
 *
 * @example
 *
 * ```typescript
 * const ExampleEnum = {
 *     FOO: 'foo',
 *     BAR: 'bar',
 * } as const;
 * type ExampleEnum = EnumTypeOf<typeof ExampleEnum>;
 *
 * (enumValue: ExampleEnum) => {
 *     // Example using a `switch` block
 *     switch (enumValue) {
 *         case ExampleEnum.FOO:
 *             // Do something
 *             break;
 *         case ExampleEnum.BAR:
 *             // Do something else
 *             break;
 *         default:
 *             // If `ExampleEnum` has any members other than `FOO` and `BAR`, then TypeScript will throw an error on this line
 *             assertAllUnionMembersHandled(enumValue);
 *     }
 * }
 *
 * (enumValue: ExampleEnum) => {
 *     // Example using an `else` block
 *     if (enumValue === ExampleEnum.FOO) {
 *         // Do something
 *     } else if (enumValue === ExampleEnum.BAR) {
 *         // Do something else
 *     } else {
 *         // If `ExampleEnum` has any members other than `FOO` and `BAR`, then TypeScript will throw an error on this line
 *         assertAllUnionMembersHandled(enumValue);
 *     }
 * }
 *
 * (enumValue: ExampleEnum) => {
 *     // Example using conditional early returns
 *     if (enumValue === ExampleEnum.FOO) {
 *         // Do something
 *         return;
 *     }
 *
 *     if (enumValue === ExampleEnum.BAR) {
 *         // Do something else
 *         return;
 *     }
 *
 *     // If `ExampleEnum` has any members other than `FOO` and `BAR`, then TypeScript will throw an error on this line
 *     assertAllUnionMembersHandled(enumValue);
 * }
 * ```
 */
export function assertAllUnionMembersHandled(value: never, getErrorMessage?: (value: unknown) => string): never;
export function assertAllUnionMembersHandled(value: unknown, getErrorMessage?: (value: unknown) => string): never {
	const errorMessage = getErrorMessage
		? getErrorMessage(value)
		: `Union member ${value} was not handled.`;

	throw new TypeError(errorMessage);
}
