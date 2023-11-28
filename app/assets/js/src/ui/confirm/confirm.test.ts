import {
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { screen } from '@testing-library/preact';

import { confirm } from './confirm';

describe('confirm', () => {
	test('returns a Promise', () => {
		expect(confirm('Test message')).toBeInstanceOf(Promise);
	});

	test('renders the message', () => {
		confirm('Test message');

		expect(screen.getByText('Test message')).toBeInTheDocument();
	});
});
