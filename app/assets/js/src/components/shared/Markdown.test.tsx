import { h } from 'preact';

import { afterEach, describe, expect, jest, test } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';

import { Markdown } from './Markdown';
import userEvent from '@testing-library/user-event';

describe('Markdown', () => {
	afterEach(() => {
		cleanup();
	});

	test('renders its content, converted to HTML', () => {
		const { getByTestId } = render(
			<Markdown content="**Bold** *italic* `code`" />
		);

		const content = getByTestId('markdown-content');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<p><strong>Bold</strong> <em>italic</em> <code>code</code></p>');
	});

	test('uses tabs for indentation, not spaces', () => {
		const text = `\`\`\`
	This is some code
\`\`\``;
		const { getByTestId } = render(
			<Markdown content={text} />
		);

		const content = getByTestId('markdown-content');
		expect(content.innerHTML.trim()).toBe('<pre><code>\tThis is some code\n</code></pre>');
	});

	test('converts "&amplt;" into "&lt;"', () => {
		const { getByText } = render(
			<Markdown content="&amp;lt;example>" />
		);

		const content = getByText(/<example>/);
		expect(content).toBeInTheDocument();
	});

	test('passes through additional props to the internal `<div>`, adding CSS classes to its existing ones', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByTestId, rerender } = render(
			<Markdown content="" />
		);

		const content = getByTestId('markdown-content');
		expect([...content.classList.values()]).toEqual(['content']);

		rerender(
			<Markdown content="" class="test" onClick={spy} />
		);
		expect(content.classList.contains('test')).toBe(true);

		expect(spy).not.toHaveBeenCalled();
		await user.click(content);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('sanitises content', () => {
		const { getByTestId } = render(
			<Markdown content="<script>window.alert('xss')</script>" />
		);

		const content = getByTestId('markdown-content');
		expect(content.textContent).toBe('window.alert(\'xss\')');
	});

	test('displays the first line of content only, unwrapped, when using the inline prop', () => {
		const content = `This is **the** *first* \`line\`

this is the second line`;

		const { getByTestId } = render(
			<Markdown
				content={content}
				inline
			/>
		);

		const contentEl = getByTestId('markdown-content');
		expect(contentEl.innerHTML).toBe('This is <strong>the</strong> <em>first</em> <code>line</code>');
	});
});
