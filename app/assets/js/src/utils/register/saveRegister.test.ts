import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import { saveRegister } from './saveRegister';
import { Register } from './Register';

const testRegister = new Register<string, number>();

describe('saveRegister', () => {
	beforeEach(() => {
		localStorage.clear();
		testRegister.clear();
	});

	test('returns a Promise that resolves when the content of the days register has been persisted', async () => {
		expect(localStorage.getItem('days')).toBeNull();

		testRegister.set('first', 1);
		testRegister.set('second', 2);

		const saveRegisterPromise = saveRegister(testRegister, 'test', ls);
		expect(saveRegisterPromise).toBeInstanceOf(Promise);
		await expect(saveRegisterPromise).resolves.toBeUndefined();

		expect(localStorage.getItem('test')).toEqual(JSON.stringify([
			['first', 1],
			['second', 2],
		]));
	});
});
