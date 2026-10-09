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

		addChangeListener(ChangeType.CHANGE, { type: ChangeEntityType.TASK, id: 1 }, listener);

		noticeChange(ChangeType.CHANGE, { type: ChangeEntityType.TASK, id: 2 });
		expect(listener).toHaveBeenCalledTimes(0);

		noticeChange(ChangeType.CHANGE, { type: ChangeEntityType.TASK, id: 1 });
		expect(listener).toHaveBeenCalledTimes(1);

		removeChangeListener(ChangeType.CHANGE, { type: ChangeEntityType.TASK, id: 1 }, listener);
		noticeChange(ChangeType.CHANGE, { type: ChangeEntityType.TASK, id: 1 });
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
