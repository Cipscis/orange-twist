import type { DatabaseData } from '../types';
import { defaultStatuses } from './defaultStatuses';

/**
 * Create minimal data to populate an empty database, which includes status data.
 */
export function createMinimalData(): DatabaseData {
	const day = {};
	const status = defaultStatuses;
	const task = {};
	const day_task = {};
	const template = {};
	const image = {};

	const updatedData: DatabaseData = {
		day,
		task,
		day_task,
		status,
		template,
		image,
	};

	return updatedData;
}
