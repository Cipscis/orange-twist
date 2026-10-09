import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import {
	ChangeEntityType,
	ChangeType,
	addChangeListener,
	noticeChange,
	removeChangeListener,
} from './liveAccessManager';

describe('liveAccessManager', () => {
	test('listens for changes based on item ID', () => {
		const listener = jest.fn();

		addChangeListener(ChangeType.CHANGE, ChangeEntityType.TASK, 1, listener);

		noticeChange(ChangeEntityType.TASK, 2);
		expect(listener).toHaveBeenCalledTimes(0);

		noticeChange(ChangeEntityType.TASK, 1);
		expect(listener).toHaveBeenCalledTimes(1);

		removeChangeListener(ChangeType.CHANGE, ChangeEntityType.TASK, 1, listener);
		noticeChange(ChangeEntityType.TASK, 1);
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
