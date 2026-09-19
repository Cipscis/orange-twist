import * as ui from 'ui';

import type { Day } from '../types';

import { ObjectStoreName } from '../metadata';
import { getDaysInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads data from all days.
 *
 * Renders an alert to the UI if loading fails.
 */
export async function loadAllDays(): Promise<Day[]> {
	const transaction = await requestTransaction([ObjectStoreName.DAY], 'readonly');

	try {
		const days = await getDaysInternal(transaction);

		return days;
	} catch (error) {
		ui.alert('Failed to load day information', {
			duration: null,
			dismissible: true,
		});
		throw error;
	}
}
