import { h } from 'preact';

import { describe, expect, jest, test } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { ModalPrompt } from './ModalPrompt';

describe('ModalPrompt', () => {
	test('displays the prompt message', () => {
		const { getByText } = render(<ModalPrompt
			message="Test message"
			resolve={() => {}}
		/>);

		expect(getByText('Test message')).toBeInTheDocument();
	});

	test('calls the resolve callback with null if nothing was entered', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		render(<ModalPrompt
			message="Test message"
			resolve={spy}
		/>);

		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledWith(null);
	});

	test('calls the resolve prop with a string if something was entered', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		render(<ModalPrompt
			message="Test message"
			resolve={spy}
		/>);

		await user.keyboard('Test response{Enter}');
		expect(spy).toHaveBeenCalledWith('Test response');
	});

	test('closes after being submitted', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(<ModalPrompt
			message="Test message"
			resolve={() => {}}
		/>);

		expect(getByRole('textbox', { name: 'Test message' })).toBeInTheDocument();
		await user.keyboard('Test response{Enter}');
		expect(queryByRole('textbox', { name: 'Test message' })).not.toBeInTheDocument();
	});

	test('re-opens when passed a new resolve callback', async () => {
		const user = userEvent.setup();

		const {
			queryByText,
			rerender,
		} = render(<ModalPrompt
			message="Test message"
			resolve={() => {}}
		/>);
		expect(queryByText('Test message')).toBeInTheDocument();

		await user.keyboard('{Escape}');
		expect(queryByText('Test message')).not.toBeInTheDocument();

		rerender(<ModalPrompt
			message="Test message"
			resolve={() => {}}
		/>);
		expect(queryByText('Test message')).toBeInTheDocument();
	});

	test('calls the resolve callback with null if it\'s changed before closing', () => {
		const spy = jest.fn();

		const { rerender } = render(<ModalPrompt
			message="Test message"
			resolve={spy}
		/>);

		expect(spy).toHaveBeenCalledTimes(0);

		rerender(<ModalPrompt
			message="Test message 2"
			resolve={() => {}}
		/>);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(null);
	});
});
