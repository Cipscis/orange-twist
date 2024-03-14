import { ZodType, z } from 'zod';

/**
 * This utility function can be used to construct a typeguard-style
 * function from a Zod schema.
 *
 * @example
 * ```typescript
 * const mySchema = z.object({
 *     foo: z.string(),
 *     bar: z.number(),
 * });
 *
 * const isMySchema = isZodSchemaType(mySchema);
 *
 * declare const val: unknown;
 *
 * if (isMySchema(val)) {
 *     val; // <- { foo: string; bar: number; }
 * }
 * ```
 */
export function isZodSchemaType<T extends ZodType>(schema: T): (value: unknown) => value is z.infer<T> {
	return (value): value is z.infer<T> => schema.safeParse(value).success;
}
