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

import { Modal } from './Modal';

describe('Modal', () => {
	afterEach(() => {
		cleanup();
	});

	test('is only rendered when open is true', () => {
		const { rerender, queryByText } = render(
			<Modal
				open={false}
				title="Modal title"
				onClose={() => {}}
			/>
		);

		expect(queryByText('Modal title')).not.toBeInTheDocument();

		rerender(<Modal
			open
			title="Modal title"
			onClose={() => {}}
		/>);

		expect(queryByText('Modal title')).toBeInTheDocument();
	});

	test('renders its title', () => {
		const { queryByRole } = render(
			<Modal
				open
				onClose={() => {}}
				title="Test title"
			/>
		);

		const title = queryByRole('heading');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent('Test title');
	});

	test('returns keyboard focus when closed', async () => {
		const user = userEvent.setup();

		const { getByRole } = render(<button>Focusable element</button>);
		const button = getByRole('button');

		const { rerender } = render(
			<>
				<Modal
					open={false}
					onClose={() => {}}
				/>
			</>
		);

		await user.click(button);
		expect(button).toHaveFocus();

		await act(() => rerender(<>
			<Modal
				open
				onClose={() => {}}
			/>
		</>));

		expect(button).not.toHaveFocus();

		await act(() => rerender(<>
			<Modal
				open={false}
				onClose={() => {}}
			/>
		</>));

		expect(button).toHaveFocus();
	});

	test('applies specified CSS classes', () => {
		const { getByTestId } = render(
			<Modal
				open
				onClose={() => {}}
				class="test-class another-class"
			/>
		);

		const modal = getByTestId('modal__body');
		expect(modal.classList.contains('test-class')).toBe(true);
		expect(modal.classList.contains('another-class')).toBe(true);
	});

	test('contains its children', () => {
		const { queryByTestId } = render(
			<Modal
				open
				onClose={() => {}}
			>
				<p data-testid="child-node">
					Child node
				</p>
				<p data-testid="second-child-node">
					Second child node
				</p>
			</Modal>
		);

		expect(queryByTestId('child-node')).toBeInTheDocument();
		expect(queryByTestId('second-child-node')).toBeInTheDocument();
	});

	test('calls onClose when pressing the Escape key', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		render(
			<Modal
				open
				onClose={spy}
			/>
		);

		expect(spy).not.toHaveBeenCalled();

		await user.keyboard('{Escape}');

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('calls onClose when pressing the close button', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByRole } = render(
			<Modal
				open
				closeButton
				onClose={spy}
			/>
		);

		expect(spy).not.toHaveBeenCalled();

		const closeButton = getByRole('button', { name: 'Close modal' });
		await user.click(closeButton);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('calls onOpen when opening, including on initial render', () => {
		const spy = jest.fn();

		const { rerender } = render(
			<Modal
				open
				onOpen={spy}
				onClose={() => {}}
			/>
		);

		expect(spy).toHaveBeenCalledTimes(1);

		rerender(
			<Modal
				open={false}
				onOpen={spy}
				onClose={() => {}}
			/>
		);

		expect(spy).toHaveBeenCalledTimes(1);

		rerender(
			<Modal
				open
				onOpen={spy}
				onClose={() => {}}
			/>
		);

		expect(spy).toHaveBeenCalledTimes(2);
	});
});
