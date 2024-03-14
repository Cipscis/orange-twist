import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { classNames } from './classNames';

describe('classNames', () => {
	test('doesn\'t modify strings', () => {
		expect(classNames('test')).toBe('test');
	});

	test('accepts objects with condition values', () => {
		expect(classNames({
			foo: true,
			bar: false,
			foobar: true,
		})).toBe('foo foobar');
	});

	test('combines arguments', () => {
		expect(classNames('foo', {
			bar: false,
			foobar: true,
		})).toBe('foo foobar');
	});

	test('ignores falsy arguments', () => {
		expect(classNames('', 'foo', undefined, {
			bar: false,
			foobar: true,
		}, null)).toBe('foo foobar');
	});

	test('excludes duplicates', () => {
		expect(classNames(
			'foo',
			'foo bar',
			{
				foo: true,
				'foo foobar': true,
			}
		)).toBe('foo bar foobar');
	});
});
