import type { ExportData } from '../types/ExportData';

import {
	getAllTaskInfo,
	getAllDayInfo,
	encodeDayTaskKey,
	getAllDayTaskInfo,
	getAllTemplateInfo,
} from 'data';
import { getAllImages, toDataUrl } from 'images';

/**
 * Write all data in memory to an ExportData object.
 */
export async function writeExportData(): Promise<ExportData> {
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
