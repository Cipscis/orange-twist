import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	cleanup,
	render,
} from '@testing-library/preact';

import { Icon } from './Icon';

describe('Icon', () => {
	afterEach(() => {
		cleanup();
	});

	test('renders with an icon and title', () => {
		const { getByTitle } = render(<Icon
			name="edit"
			title="Test label"
		/>);

		const icon = getByTitle('Test label');
		expect(icon).toBeInTheDocument();
	});

	test('omits the title if passed null', () => {
		render(<Icon
			name="edit"
			title={null}
		/>);

		const icon = document.querySelector('.icon')!;
		expect(icon).toBeInTheDocument();
		expect(icon.hasAttribute('title')).toBe(false);
	});
});
