import { useEffect, useState } from 'preact/hooks';

import { Register } from './Register.js';

export function useRegister<K, V>(
	register: Register<K, V>
): ReadonlyArray<readonly [K, V]>
export function useRegister<K, V>(
	register: Register<K, V>,
	keyToObserve: K
): V | undefined
export function useRegister<K, V>(
	register: Register<K, V>,
	keyToObserve?: K
): ReadonlyArray<readonly [K, V]> | V | undefined {
	const [value, setValue] = useState(() => {
		if (keyToObserve) {
			return register.get(keyToObserve);
		} else {
			return Array.from(register.entries());
		}
	});

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		register.addEventListener('set', ({ key, value }) => {
			if (keyToObserve) {
				if (key === keyToObserve) {
					setValue(value);
				}
			} else {
				setValue(
					Array.from(register.entries())
				);
			}
		}, { signal });

		return () => controller.abort();
	}, [register, keyToObserve]);

	return value;
}
