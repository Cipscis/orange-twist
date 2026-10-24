import { render } from './render';

/**
 * Renders the first line of a markdown string into an HTML string.
 *
 * `[[123]]` type task link shortcodes will not be converted, and any HTML tags will be converted to text instead of being left as tags.
 */
export async function renderInline(string: string): Promise<string> {
	const firstLine = string.split('\n')[0];
	const contentToRender = firstLine
		// Insert zero-width space to prevent task link shortcode
		.replace(/\[\[(\d)/g, '[[&ZeroWidthSpace;$1')
		// To allow HTML tags to be written as text inline, replace `<` with `&lt;`
		.replace(/</g, '&lt;');

	const renderedContent = await render(contentToRender);

	const cleanedRenderedContent = renderedContent
		// Remove any zero-width spaces used to prevent task link shortcode
		.replace(/\[\[&ZeroWidthSpace;(\d)/g, '[[$1')
		// Reverse the replacement of `<`, so HTML tags are written as text. This also means if I were type "&amp;lt;" in a task name it would become "<" but that's fine)
		.replace(/&amp;lt;/g, '&lt;')
		// Remove the wrapping <p> tag
		.replace(/<p>(.+)<\/p>\n?/, '$1');

	return cleanedRenderedContent;
}
