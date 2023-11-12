/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This solution is based on this discussion:
 * https://github.com/microsoft/TypeScript/issues/17002#issuecomment-1217386617
 * https://github.com/microsoft/TypeScript/issues/17002#issuecomment-1285847629
 */
type IfUnknownOrAny<T, Y, N> = unknown extends T ? Y : N;

type ArrayType<T> = Extract<
	(
		true extends false & T
			? any[]
			: T extends readonly any[]
				? T
				: unknown[]
	),
	T
>;

interface ArrayConstructor {
	isArray<T>(arg: T): arg is ArrayType<T>;
}
