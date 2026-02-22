import {
	useMemo,
} from 'preact/hooks';

import { useRegister } from 'utils';

import type {
	DayTaskIdentifier,
	DayTaskInfo,
} from '../types';
import type { RegisterKey } from 'utils';

import { dayTasksRegister } from '../dayTasksRegister';
import { decodeDayTaskKey } from '../util';
import type { UseRegisterOptions } from 'utils/register/useRegister';

interface UseAllDayTaskInfoOptions extends UseRegisterOptions {}

/**
 * Provides up to date information on all day tasks
 * matching a partial identifier. If no identifier is
 * provided, provides information on all day tasks.
 */
export function useAllDayTaskInfo(
	identifier?: Partial<DayTaskIdentifier>,
	options?: UseAllDayTaskInfoOptions,
): readonly DayTaskInfo[] {
	const {
		dayName: identifierDayName,
		taskId: identifierTaskId,
	} = {
		...identifier,
	};

	const matcher = useMemo(() => {
		if (
			typeof identifierDayName === 'undefined' &&
			typeof identifierTaskId === 'undefined'
		) {
			return () => true;
		}

		return (key: RegisterKey<typeof dayTasksRegister>) => {
			const { dayName, taskId } = decodeDayTaskKey(key);

			if (typeof identifierDayName !== 'undefined' && dayName !== identifierDayName) {
				return false;
			}

			if (typeof identifierTaskId !== 'undefined' && taskId !== identifierTaskId) {
				return false;
			}

			return true;
		};
	}, [identifierDayName, identifierTaskId]);

	return useRegister(
		dayTasksRegister,
		matcher,
		options,
	);
}
