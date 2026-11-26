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

import { createTestData } from 'database';

import { StatusButton } from './StatusButton';

const testData = createTestData();

describe('StatusButton', () => {
	test('renders a status\'s name', () => {
		const { getByTitle } = render(<StatusButton
			status={testData.status[1]}
			onStatusSelect={() => {}}
		/>);

		expect(getByTitle('Todo')).toBeInTheDocument();
	});

	test('calls its onStatusSelect callback with the correct status when clicked', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByRole } = render(<StatusButton
			status={testData.status[3]}
			onStatusSelect={spy}
		/>);

		expect(spy).not.toHaveBeenCalled();

		const button = getByRole('button', { name: 'Completed' });
		await user.click(button);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(3);
	});
});
