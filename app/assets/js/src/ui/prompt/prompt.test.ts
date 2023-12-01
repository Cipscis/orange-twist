import {
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { screen } from '@testing-library/preact';

import { prompt } from './prompt';

describe('prompt', () => {
	test('returns a Promise', () => {
		expect(prompt('Test message')).toBeInstanceOf(Promise);
	});

	test('renders the message', () => {
		prompt('Test message');

		expect(screen.getByText('Test message')).toBeInTheDocument();
	});
});
