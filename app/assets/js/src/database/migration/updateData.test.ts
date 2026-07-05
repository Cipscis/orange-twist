import {
	describe,
	expect,
	test,
} from '@jest/globals';

import type { LegacyExportDataV2_0_0, TaggedLegacyExportData } from '../types';

import { updateData } from './updateData';

describe('updateData', () => {
	describe('receiving schema 1.0.0', () => {
		test('updates to v2.0.0', async () => {
			const testImageDataUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iI0Y0OTAwQyIgZD0iTTMgMTkuNUMzIDEwLjM4OCAxMC4zODcgMyAxOS40OTkgM2M5LjExMyAwIDE2LjUgNy4zODcgMTYuNSAxNi41UzI4LjYxMiAzNiAxOS40OTkgMzZDMTAuMzg3IDM2IDMgMjguNjEzIDMgMTkuNXoiLz48cGF0aCBmaWxsPSIjNjYyMTEzIiBkPSJNMTEuNDE0IDcuNTg1Yy0uMjY3LS4yNjctLjc5Ny0uMTk3LTEuMzU1LjEyLTMuMy0yLjczMi04LjY1My0zLjY1Mi04Ljg5NS0zLjY5Mi0uNTQ2LS4wODktMS4wNTkuMjc3LTEuMTUuODIxLS4wOTEuNTQ0LjI3NiAxLjA2LjgyMSAxLjE1MS4wNTMuMDA5IDQuOTM0Ljg1NCA3LjgyMSAzLjE2LS4yNzUuNTI1LS4zMjQgMS4wMTUtLjA3IDEuMjY4LjM5LjM5MSAxLjM0LjA3NCAyLjEyMS0uNzA3Ljc4MS0uNzggMS4wOTctMS43My43MDctMi4xMjF6Ii8+PHBhdGggZmlsbD0iIzVDOTEzQiIgZD0iTTIxIDFzLTMuMTA2IDQuMzE4LTcuMDIxIDUuMjczQzExIDcgNy4wNDEgNy4wNyA2LjY0NiA2LjE1Yy0uMzk0LS45MTkgMS41NzItMy45MzcgNC45NjktNS4zOTNDMTUuMDEyLS42OTggMjEgMSAyMSAxeiIvPjwvc3ZnPg==';

			const testExportData: TaggedLegacyExportData = {
				schemaVersion: '1.0.0',
				data: {
					data: {
						days: [
							['2026-04-12', {
								name: '2026-04-12',
								note: 'Test note',
								tasks: [1, 2],
							}],
						],
						tasks: [
							[1, {
								id: 1,
								name: 'Test task one',
								note: 'Task one note',
								status: 'completed',
								sortIndex: 1,
							}],
							[2, {
								id: 2,
								name: 'Test task two',
								note: 'Task two note',
								status: 'in-progress',
							}],
						],
						['day-tasks']: [
							['2026-04-12_1', {
								dayName: '2026-04-12',
								taskId: 1,
								note: 'Day task 1 note',
								status: 'completed',
								summary: 'Day task 1 summary',
							}],
							['2026-04-12_2', {
								dayName: '2026-04-12',
								taskId: 2,
								note: 'Day task 2 note',
								status: 'in-progress',
								summary: 'Day task 2 summary',
							}],
						],
						templates: [
							[1, {
								id: 1,
								name: 'Template 1',
								template: 'Template 1 template',
								sortIndex: 1,
							}],
						],
					},
					images: {
						'hash 1': testImageDataUrl,
					},
				},
			};

			const updatedData = await updateData(testExportData);

			const image = await (await fetch(testImageDataUrl)).blob();

			expect(updatedData).toEqual({
				day: [
					{
						id: 1,
						year: 2026,
						month: 4,
						day: 12,
						note: 'Test note',
					},
				],
				task: [
					{
						id: 1,
						name: 'Test task one',
						note: 'Task one note',
						status: 3,
						sortIndex: 1,
					},
					{
						id: 2,
						name: 'Test task two',
						note: 'Task two note',
						status: 2,
						sortIndex: null,
					},
				],
				day_task: [
					{
						id: 1,
						day: 1,
						task: 1,
						note: 'Day task 1 note',
						summary: 'Day task 1 summary',
						status: 3,
						sortIndex: 0,
					},
					{
						id: 2,
						day: 1,
						task: 2,
						note: 'Day task 2 note',
						summary: 'Day task 2 summary',
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
						name: 'Template 1',
						template: 'Template 1 template',
						sortIndex: 1,
					},
				],
				image: {
					'hash 1': {
						hash: 'hash 1',
						file: image,
					},
				},
			} satisfies LegacyExportDataV2_0_0);
		});

		test('errors if it encounters a non-data URL', async () => {
			const testData: TaggedLegacyExportData = {
				schemaVersion: '1.0.0',
				data: {
					data: {
						days: [],
						tasks: [],
						['day-tasks']: [],
					},
					images: {
						'hash': 'https://example.com',
					},
				},
			};

			await expect(async () => await updateData(testData)).rejects.toThrow();
		});
	});
});
