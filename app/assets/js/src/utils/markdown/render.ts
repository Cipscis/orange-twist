import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/common';

import type { DefaultsFor } from 'utils/DefaultsFor';

import { renderer } from './renderer';
import { taskLink, template } from './extensions';

export interface RenderOptions {
	/**
	 * If set to `true`, only the first line of the content will be used, and it won't be wrapped in a `<p>` tag.
	 *
	 * @default false
	 */
	inline?: boolean;
	/**
	 * If set to `true`, the `'<'` symbol can be used without being interpreted as HTML.
	 *
	 * @default false
	 */
	allowLessThanSymbol?: boolean;
	/**
	 * If set to `false`, task links of the form `[[1]]` will not be transformed.
	 *
	 * @default true
	 */
	allowTaskLinks?: boolean;
	/**
	 * If set to `false`, markdown templates of the form `{{name|arg}}` will not be transformed.
	 *
	 * @default true
	 */
	allowTemplates?: boolean;
}

const defaults = {
	inline: false,
	allowLessThanSymbol: false,
	allowTaskLinks: true,
	allowTemplates: true,
} as const satisfies DefaultsFor<RenderOptions>;

let isMarkedInitialised = false;
/**
 * Initialise the "marked" package once before use.
 */
function initMarked() {
	if (isMarkedInitialised) {
		return;
	}
	isMarkedInitialised = true;

	marked.use({
		renderer,
		extensions: [
			taskLink,
			template,
		],
	});

	marked.use(markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code, lang, info) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		},
	}));
}

/**
 * Renders a string of markdown into an HTML string.
 */
export async function render(string: string, options?: RenderOptions): Promise<string> {
	initMarked();

	const fullOptions = { ...defaults, ...options };
	const contentToRender = processInput(string, fullOptions);

	let renderedContent = marked.parse(contentToRender, {
		breaks: true,
	});

	if (typeof renderedContent !== 'string') {
		renderedContent = await renderedContent;
	}

	renderedContent = processOutput(renderedContent, fullOptions);

	return renderedContent;
}

/**
 * Applies any necessary pre-processing based on options.
 */
function processInput(
	string: string,
	options: Required<RenderOptions>,
): string {
	let processedString = string;

	if (options.inline) {
		// Only use the first line
		processedString = string.split('\n')[0];
	}

	if (options.allowLessThanSymbol) {
		processedString = processedString
			// To allow HTML tags to be written as text inline, replace `<` with `&lt;`
			.replace(/</g, '&lt;');
	}

	if (!options.allowTaskLinks) {
		processedString = processedString
			// Insert zero-width space to prevent task link shortcode
			.replace(/\[\[(\d)/g, '[[&ZeroWidthSpace;$1');
	}

	if (!options.allowTemplates) {
		processedString = processedString
			// Insert zero-width space to prevent markdown templates
			.replaceAll('{{', '{&ZeroWidthSpace;{');
	}

	return processedString;
}

/**
 * Applies any necessary post-processing based on options.
 */
function processOutput(
	string: string,
	options: Required<RenderOptions>,
): string {
	let processedString = string;

	if (options.inline) {
		processedString = processedString
			// Remove the wrapping <p> tag
			.replace(/<p>(.+)<\/p>\n?/, '$1');
	}

	if (options.allowLessThanSymbol) {
		processedString = processedString
			// Reverse the replacement of `<`, so HTML tags are written as text. This also means if I were type "&amp;lt;" in a task name it would become "<" but that's fine)
			.replace(/&amp;lt;/g, '&lt;');
	}

	if (!options.allowTaskLinks) {
		processedString = processedString
			// Remove any zero-width spaces used to prevent task link shortcode
			.replace(/\[\[&ZeroWidthSpace;(\d)/g, '[[$1');
	}

	if (!options.allowTemplates) {
		processedString = processedString
			// Remove any zero-width spaces used to prevent markdown templates
			.replaceAll('{&ZeroWidthSpace;{', '{{');
	}

	processedString = processedString
		// Stupid fucking plugin replaces tabs with spaces
		.replace(/ {4}/g, '\t');

	return processedString.trim();
}
