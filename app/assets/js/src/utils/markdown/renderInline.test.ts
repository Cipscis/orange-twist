import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { renderInline } from './renderInline';

describe('renderInline', () => {
	test('displays the first line of content only, unwrapped, when using the inline prop', async () => {
		const content = `This is **the** *first* \`line\`

this is the second line`;

		const result = await renderInline(content);

		expect(result).toBe('This is <strong>the</strong> <em>first</em> <code>line</code>');
	});
});
