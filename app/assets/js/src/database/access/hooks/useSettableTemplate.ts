import { useMemo } from 'preact/hooks';

import {
	useSettableLiveData,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import type { Template } from '../../types';

import { SettableLiveTemplate } from '../SettableLiveTemplate';

/**
 * Attempts to load a specified template immediately, and reloads it if it is changed in the database. Provides a {@linkcode UseSettableLiveDataResult} representing the state of that loading operation, also providing a setter method and the state of any set operation.
 */
export function useSettableTemplate(templateId: number): UseSettableLiveDataResult<Template> {
	const settableTemplate = useMemo(() => {
		const settableTemplate = new SettableLiveTemplate(templateId);
		settableTemplate.observe();
		return settableTemplate;
	}, [templateId]);

	return useSettableLiveData(settableTemplate);
}
