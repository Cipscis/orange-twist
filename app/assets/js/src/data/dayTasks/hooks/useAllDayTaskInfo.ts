import {
	useMemo,
} from 'preact/hooks';

import { useRegister } from 'utils';

import {
	type DayTaskIdentifier,
	type DayTaskInfo,
} from '../types';
import type { RegisterKey } from 'utils';

import { dayTasksRegister } from '../dayTasksRegister';
import { decodeDayTaskKey } from '../util';

/**
 * Provides up to date information on all day tasks
 * matching a partial identifier. If no identifier is
 * provided, provides information on all day tasks.
 */
export function useAllDayTaskInfo(identifier?: Partial<DayTaskIdentifier>): readonly DayTaskInfo[] {
	const matcher = useMemo(() => {
		if (typeof identifier === 'undefined') {
			return () => true;
		}

		return (key: RegisterKey<typeof dayTasksRegister>) => {
			const { dayName, taskId } = decodeDayTaskKey(key);

			if ('dayName' in identifier && dayName !== identifier.dayName) {
				return false;
			}

			if ('taskId' in identifier &&
			taskId !== identifier.taskId) {
				return false;
			}

			return true;
		};
	}, [identifier]);

	return useRegister(
		dayTasksRegister,
		matcher
	);
}
