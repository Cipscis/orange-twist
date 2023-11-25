import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { assertAllUnionMembersHandled } from './assertAllUnionMembersHandled';

describe('assertAllUnionMembersHandler', () => {
	test('throws an error', () => {
		expect(() => {
			/* @ts-expect-error TypeScript should forbid calling this function except with `never` */
			assertAllUnionMembersHandled('test');
		}).toThrow(
			'Union member test was not handled.'
		);
	});

	test('allows the error message to be customised', () => {
		expect(() => {
			assertAllUnionMembersHandled(
				'test' as never,
				(value) => `Custom error message with ${value}`
			);
		}).toThrow('Custom error message with test');
	});
});
