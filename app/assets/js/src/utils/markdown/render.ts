import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

import { renderer } from './renderer';
import { taskLink, template } from './extensions';

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
export async function render(string: string): Promise<string> {
	initMarked();
	let renderedContent = marked.parse(string, {
		breaks: true,
	});

	if (typeof renderedContent !== 'string') {
		renderedContent = await renderedContent;
	}

	renderedContent = renderedContent
		// Stupid fucking plugin replaces tabs with spaces
		.replace(/ {4}/g, '\t');

	return renderedContent.trim();
}
