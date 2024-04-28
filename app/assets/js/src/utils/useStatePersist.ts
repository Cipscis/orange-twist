import { useCallback, useState } from 'preact/hooks';

/**
 * A hook to use a state value that is persisted in LocalStorage.
 * Must be serialisable to a JSON string.
 *
 * @param key - The string key to use for storing the value in LocalStorage.
 * @param defaultValue - The default value to use if no valid value is in LocalStorage.
 * @param isValid - A function used to validate the type of deserialised data
 * retrieved from LocalStorage, or a string that can be the result of the `typeof` operator.
 *
 * @example
 * ```typescript
 * const [myState, setMyState] = useStatePersist(
 *     'my-state',
 *     0,
 *     (value): value is number => typeof value === 'number'
 * );
 * ```
 */
export function useStatePersist<T>(
	key: string,
	defaultValue: T,
	isValid: (value: unknown) => value is T,
): [T, (value: T) => void] {
	const [state, setState] = useState(() => {
		const serialisedState = localStorage.getItem(key);
		if (!serialisedState) {
			return defaultValue;
		}

		try {
			const persistedState = JSON.parse(serialisedState);
			if (isValid(persistedState)) {
				return persistedState;
			}
		} catch (e) {
			// Fail silently
		}

		return defaultValue;
	});

	const setStateWithPersistence = useCallback((value: T) => {
		localStorage.setItem(key, JSON.stringify(value));
		setState(value);
	}, [key]);

	return [state, setStateWithPersistence];
}
