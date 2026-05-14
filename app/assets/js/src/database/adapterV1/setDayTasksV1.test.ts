import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';

describe('setDayTasksV1', () => {
	beforeEach(() => createTestData());

	test.todo('adds new day tasks');

	test.todo('updates existing day tasks');

	test.todo('throws an error if a day task is given a non-existent day');

	test.todo('throws an error if a day task is given a non-existent task');

	test.todo('throws an error if a day task is given a non-existent status');

	test.todo('removes removed day tasks');
});
