import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import {
	type DayTaskIdentifier,
	type DayTaskInfo,
} from '../types';
import type { RegisterKey } from 'util/register';

import { dayTasksRegister } from '../dayTasksRegister';
import { decodeDayTaskKey } from '../util';
import { getDayTaskInfo } from '../getDayTaskInfo';

/**
 * Provides up to date information on a single day task.
 */
export function useDayTaskInfo(identifier: DayTaskIdentifier): DayTaskInfo | null {
	const [thisDayTaskInfo, setThisDayTaskInfo] = useState(() => getDayTaskInfo(identifier));

	const doneInitialRender = useRef(false);

	// Update thisDayTaskInfo if the identifier changes
	useEffect(() => {
		// Don't re-set the state during initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisDayTaskInfo(getDayTaskInfo(identifier));
	}, [identifier]);

	/**
	 * Update the day task info if and only if a relevant day task has changed.
	 */
	const handleDayTaskInfoUpdate = useCallback((
		changes: { key: RegisterKey<typeof dayTasksRegister>; }[]
	) => {
		const hasChanged = Boolean(changes.find(
			({ key }) => {
				const { dayName, taskId } = decodeDayTaskKey(key);

				if (
					dayName !== identifier.dayName ||
					taskId !== identifier.taskId
				) {
					return false;
				}

				return true;
			}
		));

		if (hasChanged) {
			setThisDayTaskInfo(getDayTaskInfo(identifier));
		}
	}, [identifier]);

	// Listen for relevant changes on dayTasksRegister
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		dayTasksRegister.addEventListener(
			'set',
			handleDayTaskInfoUpdate,
			{ signal }
		);

		dayTasksRegister.addEventListener(
			'delete',
			handleDayTaskInfoUpdate,
			{ signal }
		);

		return () => controller.abort();
	}, [handleDayTaskInfoUpdate]);

	return thisDayTaskInfo;
}
