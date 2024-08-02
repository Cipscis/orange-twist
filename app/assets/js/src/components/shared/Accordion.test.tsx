import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Accordion } from './Accordion';

describe('Accordion', () => {
	afterEach(() => {
		cleanup();
	});

	test('Renders its children only when open', async () => {
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
});
