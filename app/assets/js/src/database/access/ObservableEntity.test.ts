import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { insertTestData } from '../test-utils';
import type { Task } from '../types';

import { ChangeEntityType } from './liveAccessManager';

import { ObservableEntity } from './ObservableEntity';

describe('ObservableEntity', () => {
	beforeEach(() => insertTestData());

	test('provides an initial data state', () => {
		const observable = new ObservableEntity({
			type: ChangeEntityType.TASK,
			id: 1,
		});

		expect(observable.asyncDataState).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		} satisfies AsyncDataState<Task>);
	});

	test.todo('when `observe` is called, loads data');

	test.todo('when `observe` is called, starts observing live database changes');

	test.todo('reports a loadstart event on load start');

	test.todo('reports a load event on load complete');

	test.todo('reports an error event on load error');

	test.todo('reports a loadend event on load end');

	test.todo('when `unobserve` is called, stops observing live database changes');

	test.todo('when an `AbortSignal` passed to `observe` is called, stops observing live database changes');

	test.todo('when disposed, stops observing live database changes');
});
