import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	addTaskChangeListener,
	noticeTaskChange,
	removeTaskChangeListener,
} from './liveAccessManager';

describe('liveAccessManager', () => {
	test('listens for changes based on task ID', () => {
		const listener = jest.fn();

		addTaskChangeListener(1, listener);

		noticeTaskChange(2);
		expect(listener).toHaveBeenCalledTimes(0);

		noticeTaskChange(1);
		expect(listener).toHaveBeenCalledTimes(1);

		removeTaskChangeListener(1, listener);
		noticeTaskChange(1);
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
