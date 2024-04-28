import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import { loadRegister } from './loadRegister';
import { Register } from './Register';

const testRegister = new Register<string, number>();

const isValidEntry = (entry: unknown): entry is [string, number] => {
	return Array.isArray(entry) &&
	entry.length === 2 &&
	typeof entry[0] === 'string' &&
	typeof entry[1] === 'number';
};
const asNumber = (value: unknown) => Number(value);

describe('loadRegister', () => {
	beforeEach(() => {
		localStorage.setItem('test', JSON.stringify([
			['first', 1],
			['second', 2],
		]));
		testRegister.clear();
	});

	test('returns a Promise that resolves when the register has been filled with the persisted data', async () => {
		expect(Array.from(testRegister.entries())).toEqual([]);

		const loadRegisterPromise = loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		);
		expect(loadRegisterPromise).toBeInstanceOf(Promise);

		expect(Array.from(testRegister.entries())).toEqual([]);

		const loadRegisterResult = await loadRegisterPromise;
		expect(loadRegisterResult).toBeUndefined();

		expect(Array.from(testRegister.entries())).toEqual([
			['first', 1],
			['second', 2],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(testRegister.entries())).toEqual([]);

		const loadRegisterPromise = loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		);
		expect(loadRegisterPromise).toBeInstanceOf(Promise);

		expect(Array.from(testRegister.entries())).toEqual([]);

		const loadRegisterResult = await loadRegisterPromise;
		expect(loadRegisterResult).toBeUndefined();

		expect(Array.from(testRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if persisted data can\'t be deserialised', async () => {
		localStorage.setItem('test', 'invalid JSON');

		await expect(loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		)).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if persisted data\'s doesn\'t match expected format', async () => {
		localStorage.setItem('test', JSON.stringify(['Invalid data']));

		await expect(loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		)).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if persisted data\'s values can\'t be updated', async () => {
		await expect(loadRegister(
			testRegister,
			isValidEntry,
			() => {
				throw new Error('Can\'t do it');
			},
			{
				persist: ls,
				key: 'test',
			}
		)).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		testRegister.addEventListener('delete', spy);
		testRegister.addEventListener('set', spy);

		await loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		);

		const entryObjArr = Array.from(
			testRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		);

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		const testData = [
			['third', 3],
			['second', 4],
		] as const;

		testRegister.set(testData);
		expect(Array.from(testRegister.entries())).toEqual(testData);

		await loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				persist: ls,
				key: 'test',
			}
		);

		expect(Array.from(testRegister.entries())).toEqual([
			['first', 1],
			['second', 2],
		]);
	});

	test('can be passed serialised JSON data to load directly', async () => {
		await loadRegister(
			testRegister,
			isValidEntry,
			asNumber,
			{
				data: JSON.stringify([
					['fifth', 5],
				]),
			}
		);
		expect(Array.from(testRegister.entries())).toEqual([
			['fifth', 5],
		]);
	});
});
