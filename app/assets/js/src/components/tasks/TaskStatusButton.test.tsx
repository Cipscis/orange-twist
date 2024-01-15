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

import { TaskStatus, TaskStatusName, TaskStatusSymbol } from 'types/TaskStatus';

import { TaskStatusButton } from './TaskStatusComponent/TaskStatusButton';

describe('TaskStatusButton', () => {
	test('renders a status\'s name and symbol', () => {
		const {
			getByTitle,
			getByText,
		} = render(<TaskStatusButton
			status={TaskStatus.TODO}
			onStatusSelect={() => {}}
		/>);

		expect(getByTitle(TaskStatusName[TaskStatus.TODO])).toBeInTheDocument();
		expect(getByText(TaskStatusSymbol[TaskStatus.TODO])).toBeInTheDocument();
	});

	test('calls its onStatusSelect callback with the correct status when clicked', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByRole } = render(<TaskStatusButton
			status={TaskStatus.COMPLETED}
			onStatusSelect={spy}
		/>);

		expect(spy).not.toHaveBeenCalled();

		const button = getByRole('button', { name: TaskStatusName[TaskStatus.COMPLETED] });
		await user.click(button);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(TaskStatus.COMPLETED);
	});
});
