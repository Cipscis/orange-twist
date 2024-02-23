/**
 * Creates a type that allows any `string` values, but will provide
 * autocomplete suggestions for any union members of the type `T`.
 *
 * @example
 * ```typescript
 * type Modes = StringWithAutocomplete<'on' | 'off'>;
 *
 * const foo: Mode = // ...
 * // ^ Autocomplete will suggest 'on' or 'off', but allow any string
 * ```
 */
export type StringWithAutocomplete<T extends string> = T | (string & {});
