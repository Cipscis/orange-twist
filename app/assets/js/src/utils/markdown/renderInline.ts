import { render } from './render';

export async function renderInline(string: string): Promise<string> {
	const firstLine = string.split('\n')[0];
	// Insert zero-width space to prevent task link shortcode
	const contentToRender = firstLine.replace(/\[\[(\d)/g, '[[&ZeroWidthSpace;$1');

	const renderedContent = await render(contentToRender);
	const inlineRenderedContent = renderedContent
		.replace(/<p>(.+)<\/p>\n?/, '$1');
	// Remove any zero-width spaces used to prevent task link shortcode
	return inlineRenderedContent
		.replace(/\[\[&ZeroWidthSpace;(\d)/g, '[[$1');
}
