import type { LegacyExportDataByVersion } from '../types';
import { collectStatusData } from './collectStatusData';

export function createMinimalData(): LegacyExportDataByVersion<'2.0.0'> {
	const day = {};
	const status = collectStatusData();
	const task = {};
	const day_task = {};
	const template = {};
	const image = {};

	const updatedData: LegacyExportDataByVersion<'2.0.0'> = {
		day,
		task,
		day_task,
		status,
		template,
		image,
	};

	return updatedData;
}
