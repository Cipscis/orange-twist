import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import { Button } from './Button';

describe('Button', () => {
	afterEach(() => {
		cleanup();
	});

	test('Renders a button by default', () => {
		const { getByRole } = render(<Button>Test Button</Button>);

		const button = getByRole('button', { name: 'Test Button' });
		expect(button).toBeInTheDocument();
	});

	test('Renders a link if passed an href', () => {
		const { getByRole } = render(<Button href="/path/">Test Button</Button>);

		const link = getByRole('link', { name: 'Test Button' });
		expect(link).toBeInTheDocument();
		expect((link as HTMLAnchorElement).href).toBe(`${location.origin}/path/`);
	});
});
