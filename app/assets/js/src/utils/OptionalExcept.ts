import type { ExpandType } from './ExpandType';

/**
 * Modifies an object type to make a subset of its properties optional.
 *
 * @example
 * ```ts
 * type Foo = {
 *    id: number;
 *    value: string;
 *    brand: string;
 *};
 *
 *type Bar = OptionalExcept<Foo, 'id'>;
 *  // ^ {
 *  //       id: number;
 *  //       value?: string | undefined;
 *  //       brand?: string | undefined;
 *  //   }
 * ```
 */
export type OptionalExcept<Base, P extends keyof Base> = ExpandType<
	Pick<Base, P> &
	Partial<Omit<Base, P>>
>;
