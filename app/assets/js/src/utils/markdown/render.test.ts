import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { render } from './render';

describe('render', () => {
	test('returns a Promise that resolves to the input markdown rendered as HTML', async () => {
		const result = await render('**Bold** *italic* `code`');

		expect(result).toBe(
			'<p><strong>Bold</strong> <em>italic</em> <code>code</code></p>'
		);
	});

	test('uses tabs for indentation, not spaces', async () => {
		const text = `\`\`\`
	This is some code
\`\`\``;
		const result = await render(text);

		expect(result).toBe(
			'<pre><code>\tThis is some code\n</code></pre>'
		);
	});

	test('renders external links with `target="_blank"`', async () => {
		const result = await render(`[Internal link](/test/ "Title")\n[External link](https://example.com "Title")`);

		expect(result).toBe('<p><a href="/test/" title="Title">Internal link</a><br><a href="https://example.com" target="_blank" title="Title">External link</a></p>');
	});

	test('allows line breaks without any extra syntax', async () => {
		const result = await render(`First line\nSecond line`);

		expect(result).toBe('<p>First line<br>Second line</p>');
	});

	test('renders task links', async () => {
		const result = await render(`Here's a task link: [[1]] *what do you think?*`);

		expect(result).toBe(`<p>Here&#39;s a task link: <task-link taskid="1"></task-link> <em>what do you think?</em></p>`);
	});
});
