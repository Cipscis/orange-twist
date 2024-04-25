import { h, type JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { classNames } from 'utils';

import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

import { taskLink } from './extensions/taskLink';
import { template } from './extensions/template';
import { renderer } from './renderer';

import { useAllTemplateInfo } from 'data';

interface MarkdownProps extends h.JSX.HTMLAttributes<HTMLDivElement> {
	/**
	 * The markdown content to be rendered as HTML.
	 */
	content: string;
	/**
	 * If set to `true`, only the first line of the content will be used,
	 * and it won't be wrapped in a `<p>` tag.
	 *
	 * @default false
	 */
	inline?: boolean;
}

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

export function Markdown(props: MarkdownProps): JSX.Element {
	const {
		content,
		inline,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	// Re-render whenever a template changes
	const templates = useAllTemplateInfo();

	// Render content as markup
	// Using `useLayoutEffect` prevents jittering caused by `setHTML` running after Preact renders
	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			// The wrapper should always be set by this point
			/* istanbul ignore next */
			return;
		}

		const contentToRender = (() => {
			if (inline) {
				const firstLine = content.split('\n')[0];
				// Insert zero-width space to prevent task link shortcode
				return firstLine.replace(/\[\[(\d)/g, '[[&ZeroWidthSpace;$1');
			}

			return content;
		})();

		(async () => {
			initMarked();
			let renderedContent = marked.parse(contentToRender, {
				breaks: true,
			});

			if (typeof renderedContent !== 'string') {
				renderedContent = await renderedContent;
			}

			renderedContent = renderedContent
				// Stupid fucking plugin replaces tabs with spaces
				.replace(/ {4}/g, '\t')
				// To allow HTML tags to be written as text in task names,
				// I replace `<` with `&lt;`. So, when displaying the rendered
				// content, reverse it. This also means if I were type "&amp;lt;"
				// in a task name it would become "<" but that's fine)
				.replace(/&amp;lt;/g, '&lt;');

			if (inline) {
				renderedContent = renderedContent.replace(/<p>(.+)<\/p>\n?/, '$1');
				// Remove any zero-width spaces used to prevent task link shortcode
				renderedContent = renderedContent.replace(/\[\[&ZeroWidthSpace;(\d)/g, '[[$1');
			}

			if (wrapper.setHTML) {
				wrapper.setHTML(renderedContent);
			} else {
				// `setHTML` is not supported, so falling back to vulnerable method'
				wrapper.innerHTML = renderedContent;
			}
		})();
	}, [content, inline, templates]);

	return <div
		ref={wrapperRef}
		{...passthroughProps}
		class={classNames('content', passthroughProps.class && String(passthroughProps.class))}
	/>;
}
