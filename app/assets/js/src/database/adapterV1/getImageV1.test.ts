import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

import { getImageV1 } from './getImageV1';

describe('getImageV1', () => {
	beforeAll(() => createTestData());

	test('returns a Promise that resolves to an image v1', async () => {
		const image = await getImageV1('test-hash');

		expect(image).toBeInstanceOf(Blob);
	});

	test('resolves to null if no image exists at that hash', async () => {
		const noImage = await getImageV1('no-image');

		expect(noImage).toBeNull();
	});
});
