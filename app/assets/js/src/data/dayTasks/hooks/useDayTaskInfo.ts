import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import {
	isDayTaskIdentifier,
	type DayTaskIdentifier,
	type DayTaskInfo,
} from '../types';
import type { RegisterKey } from 'util/register';

import { dayTasksRegister } from '../dayTasksRegister';
import { decodeDayTaskKey } from '../util';
import { getDayTaskInfo } from '../getDayTaskInfo';
import { getAllDayTaskInfo } from '../getAllDayTaskInfo';

/**
 * Provides up to date information on all day tasks.
 */
export function useDayTaskInfo(): DayTaskInfo[];
/**
 * Provides up to date information on all day tasks
 * matching a partial identifier.
 */
export function useDayTaskInfo(identifier: Partial<DayTaskIdentifier>): DayTaskInfo[];
/**
 * Provides up to date information on a single day task.
 */
export function useDayTaskInfo(identifier: DayTaskIdentifier): DayTaskInfo | null;
export function useDayTaskInfo(identifier?: Partial<DayTaskIdentifier>): DayTaskInfo[] | DayTaskInfo | null {
	const getEachDayTaskInfo = useCallback(() => {
		if (typeof identifier === 'undefined') {
			return getAllDayTaskInfo();
		}

		if (isDayTaskIdentifier(identifier)) {
			return getDayTaskInfo(identifier);
		}

		return getAllDayTaskInfo(identifier);
	}, [identifier]);

	const [thisDayTaskInfo, setThisDayTaskInfo] = useState(() => getEachDayTaskInfo());

	const doneInitialRender = useRef(false);

	// Update thisDayTaskInfo if the identifier changes
	useEffect(() => {
		// Don't re-set the state during initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisDayTaskInfo(getEachDayTaskInfo());
	}, [getEachDayTaskInfo]);

	/**
	 * Update the day task info if and only if a relevant day task has changed.
	 */
	const handleDayTaskInfoUpdate = useCallback((
		changes: { key: RegisterKey<typeof dayTasksRegister>; }[]
	) => {
		// If we're listening to everything, update on any change
		if (typeof identifier === 'undefined') {
			setThisDayTaskInfo(getAllDayTaskInfo());
			return;
		}

		const hasChanged = Boolean(changes.find(
			({ key }) => {
				const { dayName, taskId } = decodeDayTaskKey(key);

				if ('dayName' in identifier && dayName !== identifier.dayName) {
					return false;
				}

				if ('taskId' in identifier &&
				taskId !== identifier.taskId) {
					return false;
				}

				return true;
			}
		));

		if (hasChanged) {
			setThisDayTaskInfo(getEachDayTaskInfo());
		}
	}, [identifier, getEachDayTaskInfo]);

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
