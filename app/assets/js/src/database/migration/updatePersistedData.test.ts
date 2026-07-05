import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { StorageKey } from 'data/shared';
import { ObjectStoreName } from '../metadata';

import { updatePersistedData } from './updatePersistedData';

describe('updatePersistedData', () => {
	beforeEach(() => {
		localStorage.clear();
		indexedDB.deleteDatabase('orange-twist');
	});

	test('returns null if no persisted data exists', async () => {
		const updatedData = await updatePersistedData();

		expect(updatedData).toBeNull();
	});

	test('updates any existing data from Orange Twist v1.4.0 or lower', async () => {
		// Orange Twist 1.4.0 includes templates but not images, and still has all data in local storage
		localStorage.setItem('days', '[["2026-05-17",{"name":"2026-05-17","note":"Day 1 note","tasks":[1,2]}]]');
		localStorage.setItem('tasks', '[[1,{"id":1,"name":"Test task 1","status":"todo","note":"Test task 1 note","sortIndex":-1}],[2,{"id":2,"name":"Test task 2","status":"in-progress","note":"Test task 2 note","sortIndex":-2}]]');
		localStorage.setItem('day-tasks', '[["2026-05-17_1",{"dayName":"2026-05-17","taskId":1,"status":"todo","note":"Day task for task 1 day 1 note","summary":"Day task for task 1 day 1 summary"}],["2026-05-17_2",{"dayName":"2026-05-17","taskId":2,"status":"in-progress","note":"Day task for task 2 day 1 note","summary":"Day task for task 2 day 1 summary"}]]');
		localStorage.setItem('templates', '[[1,{"id":1,"name":"Template 1 name","template":"Template 1","sortIndex":-1}]]');

		const updatedData = await updatePersistedData();

		expect(updatedData).toEqual({
			day: [
				{
					id: 1,
					year: 2026,
					month: 5,
					day: 17,
					note: 'Day 1 note',
				},
			],
			task: [
				{
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					status: 1,
					sortIndex: -1,
				},
				{
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					status: 2,
					sortIndex: -2,
				},
			],
			day_task: [
				{
					id: 1,
					day: 1,
					task: 1,
					note: 'Day task for task 1 day 1 note',
					summary: 'Day task for task 1 day 1 summary',
					status: 1,
					sortIndex: 0,
				},
				{
					id: 2,
					day: 1,
					task: 2,
					note: 'Day task for task 2 day 1 note',
					summary: 'Day task for task 2 day 1 summary',
					status: 2,
					sortIndex: 1,
				},
			],
			status: [
				{
					id: 1,
					alias: 'todo',
				},
				{
					id: 2,
					alias: 'in-progress',
				},
				{
					id: 3,
					alias: 'completed',
				},

				{
					id: 4,
					alias: 'investigating',
				},
				{
					id: 5,
					alias: 'in-review',
				},
				{
					id: 6,
					alias: 'ready-to-test',
				},
				{
					id: 7,
					alias: 'paused',
				},
				{
					id: 8,
					alias: 'approved-to-deploy',
				},
				{
					id: 9,
					alias: 'will-not-do',
				},
			],
			template: [
				{
					id: 1,
					name: 'Template 1 name',
					template: 'Template 1',
					sortIndex: -1,
				},
			],
			image: {},
		});
	});

	test('updates any existing data stored in the database v1', async () => {
		const testImageDataUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iI0Y0OTAwQyIgZD0iTTMgMTkuNUMzIDEwLjM4OCAxMC4zODcgMyAxOS40OTkgM2M5LjExMyAwIDE2LjUgNy4zODcgMTYuNSAxNi41UzI4LjYxMiAzNiAxOS40OTkgMzZDMTAuMzg3IDM2IDMgMjguNjEzIDMgMTkuNXoiLz48cGF0aCBmaWxsPSIjNjYyMTEzIiBkPSJNMTEuNDE0IDcuNTg1Yy0uMjY3LS4yNjctLjc5Ny0uMTk3LTEuMzU1LjEyLTMuMy0yLjczMi04LjY1My0zLjY1Mi04Ljg5NS0zLjY5Mi0uNTQ2LS4wODktMS4wNTkuMjc3LTEuMTUuODIxLS4wOTEuNTQ0LjI3NiAxLjA2LjgyMSAxLjE1MS4wNTMuMDA5IDQuOTM0Ljg1NCA3LjgyMSAzLjE2LS4yNzUuNTI1LS4zMjQgMS4wMTUtLjA3IDEuMjY4LjM5LjM5MSAxLjM0LjA3NCAyLjEyMS0uNzA3Ljc4MS0uNzggMS4wOTctMS43My43MDctMi4xMjF6Ii8+PHBhdGggZmlsbD0iIzVDOTEzQiIgZD0iTTIxIDFzLTMuMTA2IDQuMzE4LTcuMDIxIDUuMjczQzExIDcgNy4wNDEgNy4wNyA2LjY0NiA2LjE1Yy0uMzk0LS45MTkgMS41NzItMy45MzcgNC45NjktNS4zOTNDMTUuMDEyLS42OTggMjEgMSAyMSAxeiIvPjwvc3ZnPg==';
		const imageBlob = await (await fetch(testImageDataUrl)).blob();

		// Construct test data for database v1
		await new Promise<void>((resolve) => {
			const openRequest = indexedDB.open('orange-twist', 1);
			openRequest.addEventListener('upgradeneeded', () => {
				const db = openRequest.result;
				db.createObjectStore(ObjectStoreName.DATA);
				db.createObjectStore(ObjectStoreName.IMAGES);
			});

			openRequest.addEventListener('success', () => {
				const db = openRequest.result;

				const transaction = db.transaction([
					ObjectStoreName.DATA,
					ObjectStoreName.IMAGES,
				], 'readwrite');

				const dataOS = transaction.objectStore(ObjectStoreName.DATA);
				const imageOS = transaction.objectStore(ObjectStoreName.IMAGES);

				dataOS.put([['2026-05-17', {'name': '2026-05-17', 'note': 'Day 1 note', 'tasks': [1, 2]}]], StorageKey.DAYS);
				dataOS.put([[1, {'id': 1, 'name': 'Test task 1', 'status': 'todo', 'note': 'Test task 1 note', 'sortIndex': -1}], [2, {'id': 2, 'name': 'Test task 2', 'status': 'in-progress', 'note': 'Test task 2 note', 'sortIndex': -2}]], StorageKey.TASKS);
				dataOS.put([['2026-05-17_1', {'dayName': '2026-05-17', 'taskId': 1, 'status': 'todo', 'note': 'Day task for task 1 day 1 note', 'summary': 'Day task for task 1 day 1 summary'}], ['2026-05-17_2', {'dayName': '2026-05-17', 'taskId': 2, 'status': 'in-progress', 'note': 'Day task for task 2 day 1 note', 'summary': 'Day task for task 2 day 1 summary'}]], StorageKey.DAY_TASKS);
				dataOS.put([[1, {'id': 1, 'name': 'Template 1 name', 'template': 'Template 1', 'sortIndex': -1}]], StorageKey.TEMPLATES);

				imageOS.put(testImageDataUrl, 'test-hash');

				resolve();
			});
		});

		const {
			image,
			...rest
		} = (await updatePersistedData())!;

		expect(rest).toEqual({
			day: [
				{
					id: 1,
					year: 2026,
					month: 5,
					day: 17,
					note: 'Day 1 note',
				},
			],
			task: [
				{
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					status: 1,
					sortIndex: -1,
				},
				{
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					status: 2,
					sortIndex: -2,
				},
			],
			day_task: [
				{
					id: 1,
					day: 1,
					task: 1,
					note: 'Day task for task 1 day 1 note',
					summary: 'Day task for task 1 day 1 summary',
					status: 1,
					sortIndex: 0,
				},
				{
					id: 2,
					day: 1,
					task: 2,
					note: 'Day task for task 2 day 1 note',
					summary: 'Day task for task 2 day 1 summary',
					status: 2,
					sortIndex: 1,
				},
			],
			status: [
				{
					id: 1,
					alias: 'todo',
				},
				{
					id: 2,
					alias: 'in-progress',
				},
				{
					id: 3,
					alias: 'completed',
				},

				{
					id: 4,
					alias: 'investigating',
				},
				{
					id: 5,
					alias: 'in-review',
				},
				{
					id: 6,
					alias: 'ready-to-test',
				},
				{
					id: 7,
					alias: 'paused',
				},
				{
					id: 8,
					alias: 'approved-to-deploy',
				},
				{
					id: 9,
					alias: 'will-not-do',
				},
			],
			template: [
				{
					id: 1,
					name: 'Template 1 name',
					template: 'Template 1',
					sortIndex: -1,
				},
			],
		});

		// Compare JSON serialised strings to get around different Blob instances in JSDOM vs Node
		expect(JSON.stringify(image, null, '\t')).toEqual(JSON.stringify({
			'test-hash': {
				hash: 'test-hash',
				file: imageBlob,
			},
		}, null, '\t'));
	});
});
