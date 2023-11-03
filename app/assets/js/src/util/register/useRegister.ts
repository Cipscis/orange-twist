import { useEffect, useState } from 'preact/hooks';

import { Register } from './Register';

/**
 * A hook for observing all changes to a {@linkcode Register}.
 *
 * @param register The `Register` to observe.
 *
 * @returns An array containing all entries in the specified `Register`.
 */
export function useRegister<K, V>(
	register: Register<K, V>
): readonly (readonly [K, V])[]
/**
 * A hook for observing changes to a specific key in a {@linkcode Register}.
 *
 * @param register The `Register` to observe.
 * @param keyToObserve The key to observe.
 *
 * @returns The value of the element with the specified key in the specified `Register`.
 */
export function useRegister<K, V>(
	register: Register<K, V>,
	keyToObserve: K
): V | undefined
export function useRegister<K, V>(
	register: Register<K, V>,
	keyToObserve?: K
): readonly (readonly [K, V])[] | V | undefined {
	// This value either stores the value of the specific key being observed,
	// if there is one, or otherwise the entire contents of the `Register`
	const [value, setValue] = useState(() => {
		if (keyToObserve) {
			return register.get(keyToObserve);
		} else {
			return Array.from(register.entries());
		}
	});

	// Add an event listener to update the value when there are changes
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (keyToObserve) {
			// Observe a specific element only
			register.addEventListener('set', ({ key, value }) => {
				if (key === keyToObserve) {
					setValue(value);
				}
			}, { signal });

			register.addEventListener('delete', ({ key }) => {
				if (key === keyToObserve) {
					setValue(undefined);
				}
			}, { signal });
		} else {
			// Observe the entire register
			register.addEventListener('change', () => {
				setValue(Array.from(register.entries()));
			}, { signal });
		}

		return () => controller.abort();
	}, [register, keyToObserve]);

	return value;
}
