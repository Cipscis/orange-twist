import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { templatesRegister } from '../templatesRegister';
import {
	type TemplateInfo,
	clear,
	loadTemplates,
} from 'data';

const firstTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '{{{0}}}',
};

const secondTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '<a href="{{{0}}}">{{{1}}}</a>',
};

describe('loadTemplates', () => {
	beforeEach(() => {
		localStorage.setItem('templates', JSON.stringify([
			['example name', { name: 'example name', ...firstTemplateInfo }],
			['another name', { name: 'another name', ...secondTemplateInfo }],
		]));
		clear();
	});

	test('returns a Promise that resolves when the templates register has been filled with the persisted templates data', async () => {
		expect(Array.from(templatesRegister.entries())).toEqual([]);

		const loadTemplatesPromise = loadTemplates();
		expect(loadTemplatesPromise).toBeInstanceOf(Promise);

		expect(Array.from(templatesRegister.entries())).toEqual([]);

		const loadTemplatesResult = await loadTemplatesPromise;
		expect(loadTemplatesResult).toBeUndefined();

		expect(Array.from(templatesRegister.entries())).toEqual([
			['example name', { name: 'example name', ...firstTemplateInfo }],
			['another name', { name: 'another name', ...secondTemplateInfo }],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(templatesRegister.entries())).toEqual([]);

		const loadTemplatesPromise = loadTemplates();
		expect(loadTemplatesPromise).toBeInstanceOf(Promise);

		expect(Array.from(templatesRegister.entries())).toEqual([]);

		const loadTemplatesResult = await loadTemplatesPromise;
		expect(loadTemplatesResult).toBeUndefined();

		expect(Array.from(templatesRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', async () => {
		localStorage.setItem('templates', 'invalid JSON');

		await expect(loadTemplates()).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', async () => {
		localStorage.setItem('templates', JSON.stringify(['Invalid data']));

		await expect(loadTemplates()).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		templatesRegister.addEventListener('delete', spy);
		templatesRegister.addEventListener('set', spy);

		await loadTemplates();

		const entryObjArr = Array.from(
			templatesRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadTemplates();

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		const testData = [
			['example name', { name: 'example name', ...firstTemplateInfo }],
			['another name', { name: 'example name', ...firstTemplateInfo }],
		] as const;

		templatesRegister.set(testData);
		expect(Array.from(templatesRegister.entries())).toEqual(testData);

		await loadTemplates();

		expect(Array.from(templatesRegister.entries())).toEqual([
			['example name', { name: 'example name', ...firstTemplateInfo }],
			['another name', { name: 'another name', ...secondTemplateInfo }],
		]);
	});

	test('can be passed serialised data as an argument', async () => {
		await loadTemplates(JSON.stringify([
			['custom template', {
				name: 'custom template',
				template: '*{{{0}}}*',
			}],
		]));
		expect(Array.from(templatesRegister.entries())).toEqual([
			['custom template', {
				name: 'custom template',
				template: '*{{{0}}}*',
			}],
		]);
	});
});
