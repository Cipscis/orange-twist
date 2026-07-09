import type { ExpandType } from './ExpandType';

/**
 * Modifies an object type to make a subset of its properties optional.
 *
 * @example
 * ```ts
 * type Foo = {
 *     id: number;
 *     value: string;
 * };
 *
 * type Bar = WithOptional<Foo, 'id'>;
 *   // ^ {
 *   //       id?: number | undefined;
 *   //       value: string;
 *   //   }
 * ```
 */
export type WithOptional<Base, P extends keyof Base> = ExpandType<
	Omit<Base, P> &
	Partial<Pick<Base, P>>
>;
