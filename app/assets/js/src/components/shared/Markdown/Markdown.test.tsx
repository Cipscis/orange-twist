import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Markdown } from './Markdown';
import { clear, setTaskInfo } from 'data';
import { TaskStatus } from 'types/TaskStatus';

describe('Markdown', () => {
	afterEach(() => {
		cleanup();
		clear();
	});

	test('renders its content, converted to HTML', () => {
		const { getByTestId } = render(
			<Markdown
				content="**Bold** *italic* `code`"
				data-testid="markdown-content"
			/>
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
			<Markdown
				content={text}
				data-testid="markdown-content"
			/>
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

	test('renders external links with `target="_blank"`', () => {
		const { getByText } = render(
			<Markdown content={`[Internal link](/test/ "Title")\n[External link](https://example.com "Title")`} />
		);

		const internalLink = getByText('Internal link');
		expect(internalLink).toBeInTheDocument();
		expect(internalLink.getAttribute('href')).toBe('/test/');
		expect(internalLink.getAttribute('target')).toBe(null);
		expect(internalLink.getAttribute('title')).toBe('Title');

		const externalLink = getByText('External link');
		expect(externalLink).toBeInTheDocument();
		expect(externalLink.getAttribute('href')).toBe('https://example.com');
		expect(externalLink.getAttribute('target')).toBe('_blank');
		expect(externalLink.getAttribute('title')).toBe('Title');
	});

	test('allows line breaks without any extra syntax', () => {
		const { getByTestId } = render(
			<Markdown
				content={`First line\nSecond line`}
				data-testid="markdown-content"
			/>
		);

		const content = getByTestId('markdown-content');
		expect(content.innerHTML).toBe('<p>First line<br>Second line</p>\n');
	});

	test('passes through additional props to the internal `<div>`, adding CSS classes to its existing ones', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const { getByTestId, rerender } = render(
			<Markdown
				content=""
				data-testid="markdown-content"
			/>
		);

		let content = getByTestId('markdown-content');
		expect([...content.classList.values()]).toEqual(['content']);

		rerender(
			<Markdown
				content=""
				class="test"
				onClick={spy}
				data-testid="different-test-id"
			/>
		);

		content = getByTestId('different-test-id');
		expect(content.classList.contains('test')).toBe(true);

		expect(spy).not.toHaveBeenCalled();
		await user.click(content);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('sanitises content', () => {
		const { getByTestId } = render(
			<Markdown
				content="<script>window.alert('xss')</script>"
				data-testid="markdown-content"
			/>
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
				data-testid="markdown-content"
			/>
		);

		const contentEl = getByTestId('markdown-content');
		expect(contentEl.innerHTML).toBe('This is <strong>the</strong> <em>first</em> <code>line</code>');
	});

	describe('renders task links', () => {
		test('for a valid task ID', () => {
			setTaskInfo(1, {
				name: 'Task name',
				status: TaskStatus.IN_PROGRESS,
			});

			const { getByTestId } = render(
				<Markdown
					content="Here's a task link: [[1]] *what do you think?*"
					data-testid="markdown-content"
				/>
			);

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('for an invalid task ID', () => {
			const { getByTestId } = render(
				<Markdown
					content="Here's a task link: [[1]] *what do you think?*"
					data-testid="markdown-content"
				/>
			);

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});
	});
});
