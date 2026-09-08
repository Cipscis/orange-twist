import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	ChangeType,
	addChangeListener,
	noticeChange,
	removeChangeListener,
} from './liveAccessManager';

describe('liveAccessManager', () => {
	test('listens for changes based on item ID', () => {
		const listener = jest.fn();

		addChangeListener(ChangeType.TASK, 1, listener);

		noticeChange(ChangeType.TASK, 2);
		expect(listener).toHaveBeenCalledTimes(0);

		noticeChange(ChangeType.TASK, 1);
		expect(listener).toHaveBeenCalledTimes(1);

		removeChangeListener(ChangeType.TASK, 1, listener);
		noticeChange(ChangeType.TASK, 1);
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
