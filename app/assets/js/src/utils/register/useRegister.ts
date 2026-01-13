import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import type { DefaultsFor } from 'utils/DefaultsFor';
import type { Register } from './Register';

export interface UseRegisterOptions {
	/**
	 * If set, any updates will be processed asynchronously by requesting an idle callback. This option is recommended for low priority background work, especially if this hook is used on many elements so a single change could cause many updates.
	 * @default false
	 */
	async?: boolean;
}

const defaultOptions: DefaultsFor<UseRegisterOptions> = {
	async: false,
};

/**
 * A hook for observing data in a {@linkcode Register}.
 *
 * @param register - The `Register` to observe.
 * @param matcher - A function used to check if data for a key should be returned. **Important:** this function must be memoised.
 * @param options - An optional object specifying configuration options.
 *
 * @returns An array containing all matching entries in the specified `Register`.
 */
export function useRegister<K, V>(
	register: Register<K, V>,
	matcher: (key: K, value: V) => boolean,
	options?: UseRegisterOptions,
): readonly V[] {
	const {
		async,
	} = useMemo(() => ({
		...defaultOptions,
		...options,
	}), [options]);

	/**
	 * Retrieve all entries matching the matcher.
	 */
	const getMatchedEntries = useCallback(() => {
		return [...register.entries()]
			.filter(([key, value]) => matcher(key, value));
	}, [register, matcher]);

	/**
	 * Check if any updated entries match the matcher.
	 */
	const hasChanged = useCallback((changes: {
		key: K;
		value: V;
	}[]) => changes.some(({ key, value }) => matcher(key, value)), [matcher]);

	/**
	 * A list of matching entries' keys, used to detect when an
	 * entry changes in a way that makes it no longer match.
	 */
	const matchedKeys = useRef<K[]>([]);

	/**
	 * Updates the list of matched entries' keys, and returns the new matched values.
	 */
	const processMatchedEntries = useCallback(() => {
		const matchedEntries = getMatchedEntries();
		matchedKeys.current = matchedEntries.map(([key]) => key);
		return matchedEntries.map(([key, value]) => value);
	}, [getMatchedEntries]);

	/**
	 * Update the list of matched entries' keys, and the `hookData` state variable.
	 */
	const updateHookData = useCallback(() => {
		const matchedValues = processMatchedEntries();
		setHookData(matchedValues);
	}, [processMatchedEntries]);

	const [hookData, setHookData] = useState(processMatchedEntries);

	const doneInitialRender = useRef(false);

	// Update hookData if method of updating it changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		updateHookData();
	}, [updateHookData]);

	/**
	 * Update the hook data on register changes if
	 * and only if the relevant data has changed.
	 */
	const handleDataUpdate = useCallback((
		changes: {
			key: K;
			value: V;
		}[]
	) => {
		// If one of the changes matches our matcher, update
		if (hasChanged(changes)) {
			updateHookData();
			return;
		}

		// Otherwise, if any previously matched entry is changed,
		// this means it no longer matches so we should update
		const matchedPreviously = changes.some(
			({ key }) => matchedKeys.current.includes(key)
		);
		if (matchedPreviously) {
			updateHookData();
		}
	}, [hasChanged, updateHookData]);

	// Listen for relevant changes on the register
	// Use a layout effect so it doesn't wait for rendering,
	// otherwise data could finish loading after we've read
	// it but before the start listening for changes
	useLayoutEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const listener = (() => {
			if (async) {
				return (changes: Parameters<typeof handleDataUpdate>[0]) => requestIdleCallback(() => handleDataUpdate(changes));
			} else {
				return handleDataUpdate;
			}
		})();

		register.addEventListener(
			'set',
			listener,
			{ signal }
		);

		register.addEventListener(
			'delete',
			listener,
			{ signal }
		);

		return () => controller.abort();
	}, [register, async, handleDataUpdate]);

	return hookData;
}
