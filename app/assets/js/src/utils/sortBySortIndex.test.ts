import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { sortBySortIndex } from './sortBySortIndex';

describe('sortBySortIndex', () => {
	test('sorts elements by sortIndex', () => {
		expect(sortBySortIndex([
			{ sortIndex: 3, label: 'a' },
			{ sortIndex: 2, label: 'b' },
			{ sortIndex: 1, label: 'c' },
			{ sortIndex: 2, label: 'd' },
		])).toEqual([
			{ sortIndex: 1, label: 'c' },
			{ sortIndex: 2, label: 'b' },
			{ sortIndex: 2, label: 'd' },
			{ sortIndex: 3, label: 'a' },
		]);
	});

	test('treats null as -Infinity', () => {
		expect(sortBySortIndex([
			{ sortIndex: 3, label: 'a' },
			{ sortIndex: 2, label: 'b' },
			{ sortIndex: null, label: 'c' },
			{ sortIndex: 1, label: 'd' },
			{ sortIndex: null, label: 'e' },
		])).toEqual([
			{ sortIndex: null, label: 'c' },
			{ sortIndex: null, label: 'e' },
			{ sortIndex: 1, label: 'd' },
			{ sortIndex: 2, label: 'b' },
			{ sortIndex: 3, label: 'a' },
		]);
	});
});
