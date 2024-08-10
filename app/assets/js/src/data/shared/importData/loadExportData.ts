import type { ExportDataLike } from '../types/ExportDataLike';

import type { PersistApi } from 'persist';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	loadDayTasks,
	loadDays,
	loadTasks,
	loadTemplates,
} from 'data';
import { setAllImages } from 'images';

import { exportDataSchema } from '../types/ExportData';
import { CustomEventName } from 'types/CustomEventName';
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
		loadDays(persist, JSON.stringify(data.days)),
		loadTasks(persist, JSON.stringify(data.tasks)),
		loadDayTasks(persist, JSON.stringify(data.dayTasks)),
		loadTemplates(persist, JSON.stringify(data.templates ?? [])),
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
	} catch (e) {
		try {
			// If something went wrong, try to restore the backup
			await loadExportDataDirect(persist, backup);
		} catch (e) {
			// If restoring the backup failed, try to load persisted data again
			await Promise.all([
				loadDays(persist),
				loadTasks(persist),
				loadDayTasks(persist),
				loadTemplates(persist),
				setAllImages(await getImageEntries(backup)),
			]);
		}

		// Then re-throw error so it bubbles up
		throw e;
	}

	// Force all notes to re-render once we're all finished
	document.dispatchEvent(new CustomEvent(CustomEventName.IMPORT_COMPLETE));

	fireCommand(Command.DATA_SAVE);
}
