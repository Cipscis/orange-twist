import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils';

import {
	type DayTaskIdentifier,
	type DayTaskInfo,
} from '../types';

import { dayTasksRegister } from '../dayTasksRegister';
import { encodeDayTaskKey } from '../util';

/**
 * Provides up to date information on a single day task.
 */
export function useDayTaskInfo(identifier: DayTaskIdentifier): DayTaskInfo | null {
	const identifierKey = encodeDayTaskKey(identifier);

	return useRegister(
		dayTasksRegister,
		useCallback(
			(key) => key === identifierKey,
			[identifierKey]
		)
	)[0] ?? null;
}
