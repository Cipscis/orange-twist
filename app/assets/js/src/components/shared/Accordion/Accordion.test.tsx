import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	act,
	cleanup,
	render,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Accordion } from './Accordion';

describe('Accordion', () => {
	afterEach(() => {
		cleanup();
	});

	test('Renders its children immediately if initially open', () => {
		const { getByText } = render(
			<Accordion
				summary="Title"
				open
			>
				<span>Child</span>
			</Accordion>
		);

		const child = getByText('Child');
		expect(child).toBeInTheDocument();
	});

	test('Renders its children immediately when opened', async () => {
		const user = userEvent.setup();

		const { getByText, queryByText } = render(
			<Accordion
				summary="Title"
			>
				<span>Child</span>
			</Accordion>
		);

		const summary = getByText('Title');
		expect(summary).toBeInTheDocument();

		let child = queryByText('Child');
		expect(child).not.toBeInTheDocument();

		await user.click(summary);

		child = queryByText('Child');
		expect(child).toBeInTheDocument();
	});

	test('Renders its children within 1.5 seconds', () => {
		jest.useFakeTimers();
		const { queryByText } = render(
			<Accordion
				summary="Title"
			>
				<span>Child</span>
			</Accordion>
		);

		let child = queryByText('Child');
		expect(child).not.toBeInTheDocument();

		// Wait for idle rendering to complete
		act(() => jest.advanceTimersByTime(1500));
		jest.useRealTimers();

		child = queryByText('Child');
		expect(child).toBeInTheDocument();
	});
});
