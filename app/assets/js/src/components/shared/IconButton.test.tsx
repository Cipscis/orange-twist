import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import { IconButton } from './IconButton';

describe('IconButton', () => {
	afterEach(() => {
		cleanup();
	});

	test('Renders a button by default', () => {
		const { getByRole } = render(<IconButton
			title="Test Icon Button"
			icon="🟩"
		/>);

		const button = getByRole('button', { name: 'Test Icon Button' });
		expect(button).toBeInTheDocument();
	});

	test('Renders a link if passed an href', () => {
		const { getByRole } = render(<IconButton
			href="/path/"
			title="Test Icon Button"
			icon="🟩"
		/>);

		const link = getByRole('link', { name: 'Test Icon Button' });
		expect(link).toBeInTheDocument();
		expect((link as HTMLAnchorElement).href).toBe(`${location.origin}/path/`);
	});
});
