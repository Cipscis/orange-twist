import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/preact';

import { clear, createTask } from 'data';

import { prompt, PromptType } from './prompt';

describe('prompt', () => {
	afterEach(() => {
		cleanup();
		clear();
	});

	test('returns a Promise', () => {
		expect(
			prompt('Test message', { type: PromptType.TEXT })
		).toBeInstanceOf(Promise);
	});

	test('renders the message', () => {
		prompt('Test message', { type: PromptType.TEXT });

		expect(screen.getByText('Test message')).toBeInTheDocument();
	});

	test('allows entering text', async () => {
		const user = userEvent.setup();

		const promise = prompt('Type some text', { type: PromptType.TEXT });

		const input = await screen.findByLabelText<HTMLInputElement>('Type some text');
		const submitButton = await screen.findByRole<HTMLButtonElement>('button', { name: 'Okay' });

		input.value = 'Test input';
		await user.click(submitButton);

		const enteredText = await promise;
		expect(enteredText).toBe('Test input');
	});

	test('allows selecting a date', async () => {
		const user = userEvent.setup();

		const promise = prompt('Select a day', { type: PromptType.DATE });

		const datePicker = await screen.findByLabelText<HTMLInputElement>('Select a day');
		const submitButton = await screen.findByRole<HTMLButtonElement>('button', { name: 'Okay' });

		datePicker.valueAsDate = new Date('2025-11-30T00:00:00.000Z');
		await user.click(submitButton);

		const selectedDate = await promise;
		expect(selectedDate).toBe('2025-11-30');
	});

	test('allows selecting a task', async () => {
		const user = userEvent.setup();

		// Create some dummy tasks
		createTask({ name: 'Task 1' });
		createTask({ name: 'Task 2' });
		createTask({ name: 'Task 3' });

		const promise = prompt('Select a task', { type: PromptType.TASK });

		const taskPicker = await screen.findByLabelText<HTMLSelectElement>('Select a task');
		const submitButton = await screen.findByRole<HTMLButtonElement>('button', { name: 'Okay' });

		await user.selectOptions(taskPicker, '2');
		await user.click(submitButton);

		const selectedTask = await promise;
		expect(selectedTask).toBe(2);
	});
});
