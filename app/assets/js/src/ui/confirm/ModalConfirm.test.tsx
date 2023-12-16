import { h } from 'preact';

import {
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { ModalConfirm } from './ModalConfirm';

describe('ModalConfirm', () => {
	test('displays the prompt message', () => {
		const { getByText } = render(<ModalConfirm
			message="Test message"
			resolve={() => {}}
		/>);

		expect(getByText('Test message')).toBeInTheDocument();
	});

	test('calls the resolve callback with false the modal was closed', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		render(<ModalConfirm
			message="Test message"
			resolve={spy}
		/>);

		await user.keyboard('{Escape}');
		expect(spy).toHaveBeenCalledWith(false);
	});

	test('calls the resolve prop with true if the "Confirm" button was pressed', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		const { getByRole } = render(<ModalConfirm
			message="Test message"
			resolve={spy}
		/>);

		await user.click(getByRole('button', { name: 'Confirm' }));
		expect(spy).toHaveBeenCalledWith(true);
	});

	test('calls the resolve prop with false if the "Cancel" button was pressed', async () => {
		const user = userEvent.setup();

		const spy = jest.fn();
		const { getByRole } = render(<ModalConfirm
			message="Test message"
			resolve={spy}
		/>);

		await user.click(getByRole('button', { name: 'Cancel' }));
		expect(spy).toHaveBeenCalledWith(false);
	});

	test('re-opens when passed a new resolve callback', async () => {
		const user = userEvent.setup();

		const {
			queryByText,
			rerender,
		} = render(<ModalConfirm
			message="Test message"
			resolve={() => {}}
		/>);
		expect(queryByText('Test message')).toBeInTheDocument();

		await user.keyboard('{Escape}');
		expect(queryByText('Test message')).not.toBeInTheDocument();

		rerender(<ModalConfirm
			message="Test message"
			resolve={() => {}}
		/>);
		expect(queryByText('Test message')).toBeInTheDocument();
	});

	test('calls the resolve callback with false if it\'s changed before closing', () => {
		const spy = jest.fn();

		const { rerender } = render(<ModalConfirm
			message="Test message"
			resolve={spy}
		/>);

		expect(spy).toHaveBeenCalledTimes(0);

		rerender(<ModalConfirm
			message="Test message 2"
			resolve={() => {}}
		/>);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(false);
	});
});
