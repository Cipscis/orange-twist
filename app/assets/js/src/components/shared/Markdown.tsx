import { h, type JSX } from 'preact';

import classNames from 'classnames';

import { marked } from 'marked';
import { useLayoutEffect, useRef } from 'preact/hooks';

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

		let renderedContent = marked
			.parse(contentToRender, {
				breaks: true,
			})
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
	}, [content, inline]);

	return <div
		ref={wrapperRef}
		{...passthroughProps}
		class={classNames('content', passthroughProps.class && String(passthroughProps.class))}
	/>;
}
