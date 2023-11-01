import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { Register } from './Register.js';

describe('Register', () => {
	test('supports get and set methods', () => {
		const register = new Register<string, unknown>();

		expect(register.get('key')).toBe(undefined);
		register.set('key', 'value');
		expect(register.get('key')).toBe('value');
		register.set('key', 'new value');
		expect(register.get('key')).toBe('new value');
	});

	test('supports has and delete methods', () => {
		const register = new Register([['foo', 1]]);

		expect(register.has('foo')).toBe(true);
		expect(register.has('foobar')).toBe(false);

		expect(register.delete('foo')).toBe(true);
		expect(register.has('foo')).toBe(false);

		expect(register.delete('foo')).toBe(false);
	});

	test('supports entries method', () => {
		const register = new Register<string, number>();

		register.set('foo', 1);
		register.set('bar', 2);

		const entries = register.entries();

		// Should be iterable
		expect(typeof entries[Symbol.iterator]).toBe('function');
		// Should contain the entries put in the register
		expect(Array.from(entries)).toEqual([
			['foo', 1],
			['bar', 2],
		]);
	});

	test('can be initialised with an iterable', () => {
		const map = new Map<string, number>();
		map.set('foo', 1);
		map.set('bar', 2);

		const register = new Register(map.entries());

		expect(Array.from(register.entries())).toEqual([
			['foo', 1],
			['bar', 2],
		]);
	});

	test('allows "set" events to be bound via addEventListener', () => {
		const register = new Register<string, unknown>();
		const spy = jest.fn();

		register.addEventListener('set', spy);

		expect(spy).not.toHaveBeenCalled();

		register.set('key', 'value');

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({
			key: 'key',
			value: 'value',
		});
	});

	test('allows "set" events to be removed via removeEventListener', () => {
		const register = new Register<string, unknown>();
		const spy = jest.fn();

		register.addEventListener('set', spy);
		register.set('key', 'value');

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({
			key: 'key',
			value: 'value',
		});

		register.removeEventListener('set', spy);

		register.set('key', 'new value');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('allows "set" events to be removed by aborting an AbortSignal', () => {
		const register = new Register<string, unknown>();
		const spy = jest.fn();

		const controller = new AbortController();
		const { signal } = controller;

		register.addEventListener('set', spy, { signal });
		register.set('key', 'value');

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith({
			key: 'key',
			value: 'value',
		});

		controller.abort();

		register.set('key', 'new value');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('does not bind "set" events if an already aborted AbortSignal is passed', () => {
		const register = new Register<string, unknown>();
		const spy = jest.fn();

		const signal = AbortSignal.abort();

		register.addEventListener('set', spy, { signal });
		register.set('key', 'value');

		expect(spy).not.toHaveBeenCalled();
	});

	test('does not fire "set" events if the value was not changed', () => {
		const register = new Register([['foo', 1]]);
		const spy = jest.fn();

		register.addEventListener('set', spy);
		register.set('foo', 1);

		expect(spy).not.toHaveBeenCalled();

		register.set('foo', 2);
		register.set('foo', 2);

		expect(spy).toHaveBeenCalledTimes(1);
	});
});
