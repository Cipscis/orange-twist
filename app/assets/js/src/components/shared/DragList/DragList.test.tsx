import { h } from 'preact';
import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { render } from '@testing-library/preact';

import { DragList } from './DragList';

describe('DragList', () => {
	test('requires each child to have a unique numeric key that\'s not NaN', () => {
		// Requires keys when able to reorder
		expect(() => {
			render(
				<DragList onReorder={() => {}}>
					<div data-drag-list-key={1}>A</div>
					<div data-drag-list-key={2}>B</div>
					<div>C</div>
				</DragList>
			);
		}).toThrow();

		// Requires numeric keys
		expect(() => {
			render(
				<DragList onReorder={() => {}}>
					<div data-drag-list-key={1}>A</div>
					<div data-drag-list-key={2}>B</div>
					<div data-drag-list-key={'C'}>C</div>
				</DragList>
			);
		}).toThrow();

		// Requires keys not be NaN
		expect(() => {
			render(
				<DragList onReorder={() => {}}>
					<div data-drag-list-key={1}>A</div>
					<div data-drag-list-key={2}>B</div>
					<div data-drag-list-key={NaN}>C</div>
				</DragList>
			);
		}).toThrow();

		// Requires unique keys
		expect(() => {
			render(
				<DragList onReorder={() => {}}>
					<div data-drag-list-key={1}>A</div>
					<div data-drag-list-key={2}>B</div>
					<div data-drag-list-key={2}>C</div>
				</DragList>
			);
		}).toThrow();

		// Unique numeric keys work
		expect(() => {
			render(
				<DragList onReorder={() => {}}>
					<div data-drag-list-key={1}>A</div>
					<div data-drag-list-key={2}>B</div>
					<div data-drag-list-key={3}>C</div>
				</DragList>
			);
		}).not.toThrow();
	});
});
