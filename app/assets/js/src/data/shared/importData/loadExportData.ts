import type { ExportDataLike } from '../types/ExportDataLike';

import type { PersistApi } from 'persist';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';
import { saveRegister } from 'utils/register';

import { StorageKey } from '../StorageKey';
import { loadDayTasksRegister } from '../../dayTasks';
import { loadDaysRegister } from '../../days';
import { loadTasksRegister } from '../../tasks';
import { loadTemplatesRegister } from '../../templates';
import { templatesRegister } from '../../templates/templatesRegister';
import { tasksRegister } from '../../tasks/tasksRegister';
import { daysRegister } from '../../days/daysRegister';
import { dayTasksRegister } from '../../dayTasks/dayTasksRegister';

import { setAllImages } from 'images';

import { exportDataSchema } from '../types/ExportData';
import { writeExportData } from '../exportData/writeExportData';

/**
 * Convert the image data from an `ImportDataLike` into an array
 * of `[key, value]` entries with image data as `Blob`s.
 */
async function getImageEntries(
	data: ExportDataLike
): Promise<readonly (readonly [string, Blob])[]> {
	/** Image entries as data URLs */
	const serialisedImages = (() => {
		try {
			return exportDataSchema.shape.images.parse(data.images);
		} catch (e) {
			return [];
		}
	})();

	/** Image entries as `Blob`s */
	const images = await Promise.all(
		serialisedImages.map(async ([key, imageUrl]) => {
			// Convert data URL to `Blob`
			const image = await (await fetch(imageUrl)).blob();

			return [key, image] as const;
		})
	);

	return images;
}

/**
 * Try to load a set of data directly into memory.
 * If it fails, the Promise it returns will reject.
 */
async function loadExportDataDirect(
	persist: PersistApi,
	data: ExportDataLike
): Promise<void> {
	await Promise.all([
		loadTasksRegister(persist, JSON.stringify(data.tasks)),
		loadDaysRegister(persist, JSON.stringify(data.days)),
		loadDayTasksRegister(persist, JSON.stringify(data.dayTasks)),
		loadTemplatesRegister(persist, JSON.stringify(data.templates ?? [])),
		setAllImages(await getImageEntries(data)),
	]);
}

/**
 * Try to load a set of data directly into memory.
 * If it fails, restores a backup.
 */
export async function loadExportData(
	persist: PersistApi,
	data: ExportDataLike
): Promise<void> {
	// Take a backup in case we hit an error
	const backup = await writeExportData();

	try {
		await loadExportDataDirect(persist, data);
		await Promise.all([
			saveRegister(tasksRegister, {
				persist,
				key: StorageKey.TASKS,
			}),
			saveRegister(daysRegister, {
				persist,
				key: StorageKey.DAYS,
			}),
			saveRegister(dayTasksRegister, {
				persist,
				key: StorageKey.DAY_TASKS,
			}),
			saveRegister(templatesRegister, {
				persist,
				key: StorageKey.TEMPLATES,
			}),
		]);
	} catch (e) {
		try {
			// If something went wrong, try to restore the backup
			await loadExportDataDirect(persist, backup);
		} catch (e) {
			// If restoring the backup failed, try to load persisted data again
			await Promise.all([
				loadTasksRegister(persist),
				loadDaysRegister(persist),
				loadDayTasksRegister(persist),
				loadTemplatesRegister(persist),
				setAllImages(await getImageEntries(backup)),
			]);
		}

		// Then re-throw error so it bubbles up
		throw e;
	}

	fireCommand(Command.DATA_SAVE);
}
