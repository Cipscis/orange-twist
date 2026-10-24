import { h } from 'preact';

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	cleanup,
	render,
	waitFor,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { Markdown } from './Markdown';
import {
	clear,
	setTemplateInfo,
} from 'data';

describe('Markdown', () => {
	afterEach(() => {
		cleanup();
		clear();
	});

	test('renders its content, converted to HTML', async () => {
		const { getByTestId } = render(
			<Markdown
				content="**Bold** *italic* `code`"
				data-testid="markdown-content"
			/>
		);

		const content = getByTestId('markdown-content');
		expect(content).toBeInTheDocument();
		await waitFor(() => {
			expect(content.innerHTML).toBe(
				'<p><strong>Bold</strong> <em>italic</em> <code>code</code></p>'
			);
		});
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

	test('sanitises content', async () => {
		const { getByTestId } = render(
			<Markdown
				content="<script>window.alert('xss')</script>"
				data-testid="markdown-content"
			/>
		);

		const content = getByTestId('markdown-content');
		await waitFor(() => {
			expect(content.textContent).toBe('window.alert(\'xss\')');
		});
	});

	test('displays the first line of content only, unwrapped, when using the inline prop', async () => {
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
		await waitFor(() => {
			expect(contentEl.innerHTML).toBe(
				'This is <strong>the</strong> <em>first</em> <code>line</code>'
			);
		});
	});

	describe('renders templates', () => {
		beforeEach(() => {
			setTemplateInfo(1, {
				name: 'simple',
				template: '**simple**',
			});
			setTemplateInfo(2, {
				name: 'args',
				template: '*{{{0}}}* *{{{1}}}*',
			});
			setTemplateInfo(3, {
				name: 'args-defaults',
				template: '<a href="{{{0}}}">{{{1|default}}}</a>',
			});
			setTemplateInfo(4, {
				name: 'empty',
				template: ' ',
			});
		});

		afterEach(() => {
			clear();
		});

		test('ignores unrecognised templates', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{no-template}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('with a recognised name', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{simple}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('with numbered arguments', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{args|arg0|arg1}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('with default argument values', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{args-defaults|https://www.example.com}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('renders message for empty templates', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{empty}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});

		test('renders two templates with arguments on the same line', async () => {
			const { getByTestId } = render(
				<Markdown
					content="{{args|arg0|arg1}} {{args|arg0|arg1}}"
					data-testid="markdown-content"
				/>
			);

			// Rendering is asynchronous, so wait for the next task. Snapshot testing doesn't seem to support waitFor
			await new Promise<void>((resolve) => setTimeout(() => resolve()));

			const content = getByTestId('markdown-content');
			expect(content).toMatchSnapshot();
		});
	});
});
