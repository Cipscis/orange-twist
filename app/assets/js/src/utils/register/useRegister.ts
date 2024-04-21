import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { Register } from './Register';

/**
 * A hook for observing data in a {@linkcode Register}.
 *
 * @param register - The `Register` to observe.
 * @param matcher - A function used to check if data for a key should be returned. **Important:** this function must be memoised.
 *
 * @returns An array containing all matching entries in the specified `Register`.
 */
export function useRegister<K, V>(
	register: Register<K, V>,
	matcher: (key: K) => boolean,
): readonly V[] {
	/**
	 * Retrieve all values with keys matching the matcher.
	 */
	const getData = useCallback(() => {
		return [...register.entries()]
			.filter(([key]) => matcher(key))
			.map(([, value]) => value);
	}, [register, matcher]);

	/**
	 * Check if any updated keys match the matcher.
	 */
	const hasChanged = useCallback((changes: { key: K; }[]) => changes.some(({ key }) => matcher(key)), [matcher]);

	const [hookData, setHookData] = useState(() => getData());

	const doneInitialRender = useRef(false);

	// Update hookInfo if getData method changes
	useEffect(() => {
		// Don't re-set the state during the iniital render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setHookData(getData());
	}, [getData]);

	/**
	 * Update the hook data if and only if the relevant data has changed.
	 */
	const handleDataUpdate = useCallback((
		changes: {
			key: K;
			value: V;
		}[]
	) => {
		if (hasChanged(changes)) {
			setHookData(getData());
		}
	}, [hasChanged, getData]);

	// Listen for relevant changes on the register
	// Use a layout effect so it doesn't wait for rendering,
	// otherwise data could finish loading after we've read
	// it but before the start listening for changes
	useLayoutEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		register.addEventListener(
			'set',
			handleDataUpdate,
			{ signal }
		);

		register.addEventListener(
			'delete',
			handleDataUpdate,
			{ signal }
		);

		return () => controller.abort();
	}, [register, handleDataUpdate]);

	return hookData;
}
