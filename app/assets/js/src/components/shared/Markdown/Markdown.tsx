import { h, type JSX } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { classNames } from 'utils';

import { marked, type Tokens } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { getTaskInfo } from 'data';
import { TaskStatusSymbol } from 'types/TaskStatus';

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

marked.use({
	renderer: {
		link(href, title, text) {
			try {
				// Render external links in a new tab
				const url = new URL(href, location.origin);
				const isExternal = url.origin !== location.origin;

				return `<a href="${href}"${
					isExternal
						? ' target="_blank"'
						: ''
				}${
					title
						? ` title="${title}"`
						: ''
				}>${text}</a>`;
			} catch (e) {
				// Could not construct a valid URL
				return `<a href="${href}"${
					title
						? ` title="${title}"`
						: ''
				}>${text}</a>`;
			}
		},
	},
	extensions: [
		{
			name: 'taskLink',
			level: 'inline',
			start(src) {
				// Tell Marked when to stop and check for a match
				return src.match(/\[\[\d/)?.index;
			},
			tokenizer(src, tokens) {
				// Expression for complete token, from its start
				// Match a number in double square braces, and collect any following text
				// e.g. "[[48]]"
				const rule = /^(\[\[(\d+)\]\])(.*?)(?:$|\n)/;
				const match = rule.exec(src);
				if (!match) {
					return undefined;
				}

				const token = {
					type: 'taskLink',
					raw: match[0],
					taskId: match[2],
					remainder: match[3],
					tokens: [],
				};
				// Tell the lexer to parse anything in the remainder
				this.lexer.inline(token.remainder, token.tokens);
				return token;
			},
			renderer(token) {
				const taskLink = (() => {
					const taskId = Number(token.taskId);
					if (isNaN(taskId)) {
						// TODO: Needs styling
						return `Invalid task ID ${token.taskId}`;
					}

					const taskInfo = getTaskInfo(taskId);
					if (!taskInfo) {
						// TODO: Needs styling
						return `No task with ID ${taskId}`;
					}

					// TODO: Needs styling
					const taskLink = `<a href="/task?id=${token.taskId}" class="task-link"><span class="task-link__status">${TaskStatusSymbol[taskInfo.status]}</span> <span class="task-link__name">${taskInfo.name}</span></a>`;
					return taskLink;
				})()

				const remainder = this.parser.parseInline(token.tokens ?? []);
				return `${taskLink}${remainder}`;
			},
		},
	],
});

marked.use(markedHighlight({
	langPrefix: 'hljs language-',
	highlight(code, lang, info) {
		const language = hljs.getLanguage(lang)?.name ?? 'plaintext';
		return hljs.highlight(code, { language }).value;
	},
}));

export function Markdown(props: MarkdownProps): JSX.Element {
	const {
		content,
		inline,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	// Using `useLayoutEffect` prevents jittering caused by `setHTML` running after Preact renders
	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			// The wrapper should always be set by this point
			/* istanbul ignore next */
			return;
		}

		const contentToRender = inline
			? content.split('\n')[0]
			: content;

		(async () => {
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
			}

			if (wrapper.setHTML) {
				wrapper.setHTML(renderedContent);
			} else {
				// `setHTML` is not supported, so falling back to vulnerable method'
				wrapper.innerHTML = renderedContent;
			}
		})();
	}, [content, inline]);

	return <div
		ref={wrapperRef}
		{...passthroughProps}
		class={classNames('content', passthroughProps.class && String(passthroughProps.class))}
	/>;
}
