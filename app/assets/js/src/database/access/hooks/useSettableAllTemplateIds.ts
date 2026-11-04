import { useMemo } from 'preact/hooks';

import {
	useSettableLiveData,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import { SettableAllTemplateIds } from '../SettableAllTemplateIds';

/**
 * Attempts to load a list of all template IDs. Provides an {@linkcode UseSettableLiveDataResult} representing the state of that loading operation, as well as a setter for updating their order.
 */
export function useSettableAllTemplateIds(): UseSettableLiveDataResult<readonly number[]> {
	const settableAllTemplateIds = useMemo(() => {
		const settableAllTemplateIds = new SettableAllTemplateIds();
		settableAllTemplateIds.observe();
		return settableAllTemplateIds;
	}, []);

	return useSettableLiveData(settableAllTemplateIds);
}
