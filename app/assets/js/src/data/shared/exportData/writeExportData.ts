import type { ExportData } from '../types/ExportData';

import { getAllTaskInfo, loadTasksRegister } from '../../tasks';
import { getAllDayInfo, loadDaysRegister } from '../../days';
import {
	encodeDayTaskKey,
	getAllDayTaskInfo,
	loadDayTasksRegister,
} from '../../dayTasks';
import { getAllTemplateInfo, loadTemplatesRegister } from '../../templates';

import { getAllImages, toDataUrl } from 'images';
import { local } from 'persist';

/**
 * Write all data in memory to an ExportData object.
 */
export async function writeExportData(): Promise<ExportData> {
	// Nothing else maintains the legacy in-memory cache, so refresh it first in order to read export data from it
	await Promise.all([
		loadDaysRegister(local),
		loadTasksRegister(local),
		loadDayTasksRegister(local),
		loadTemplatesRegister(local),
	]);
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
		templates: getAllTemplateInfo().map(
			(templateInfo) => [templateInfo.id, templateInfo],
		),
		images: await (async () => {
			const allImages = await getAllImages();

			// Convert all images to base64 encoded data URLs for serialisation
			const encodedImageEntries = await Promise.all(
				allImages.map(async ([key, file]) => {
					return [key, await toDataUrl(file)] as const;
				})
			);
			return encodedImageEntries;
		})(),
	};

	return data;
}
