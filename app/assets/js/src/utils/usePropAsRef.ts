import type { RefObject } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

/**
 * This hook constructs a readonly ref that always contains the
 * value of a given prop. This can be useful, for example, to
 * construct callbacks with `useCallback` without needing to
 * tell Preact to re-create them (possibly causing side effects
 * such as binding event listeners) whenver the prop changes.
 *
 * @example
 * ```typescript
 * function MyComponent(props: MyComponentProps): JSX.Element {
 *     const fooRef = usePropAsRef(props.foo);
 *
 *     const logFooToConsole = useCallback(
 *         () => {
 *             // Always log the current value of `props.foo`
 *             console.log(fooRef.current);
 *         },
 *         // Unlike props.foo, fooRef never changes
 *         [fooRef]
 *     );
 * }
 * ```
 */
export function usePropAsRef<T>(prop: T): Readonly<RefObject<T>> {
	const propRef = useRef(prop);
	useEffect(() => {
		propRef.current = prop;
	}, [prop]);

	return propRef;
}
