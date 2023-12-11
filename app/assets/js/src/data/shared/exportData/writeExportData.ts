import type { ExportData } from '../types/ExportData';

import { getAllTaskInfo } from '../../tasks';
import { getAllDayInfo } from '../../days';
import { encodeDayTaskKey, getAllDayTaskInfo } from '../../dayTasks';

/**
 * Write all data in memory to an ExportData object.
 */
export function writeExportData(): ExportData {
	const data: ExportData = {
		days: getAllDayInfo().map(
			(dayInfo) => [dayInfo.name, dayInfo]
		),
		tasks: getAllTaskInfo().map(
			(taskInfo) => [taskInfo.id, taskInfo]
		),
		dayTasks: getAllDayTaskInfo().map(
			(dayTaskInfo) => [encodeDayTaskKey(dayTaskInfo), dayTaskInfo]
		),
	};

	return data;
}
