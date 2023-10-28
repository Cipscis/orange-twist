import { h } from 'preact';

import classNames from 'classnames';

import { marked } from 'marked';
import { useLayoutEffect, useRef } from 'preact/hooks';

interface MarkdownProps extends h.JSX.HTMLAttributes<HTMLDivElement> {
	content: string;
}

export function Markdown(props: MarkdownProps) {
	const {
		content,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	// Using `useLayoutEffect` prevents jittering caused by `setHTML` running after Preact renders
	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			return;
		}

		const renderedContent = marked
			.parse(content)
			// Stupid fucking plugin replaces tabs with spaces
			.replace(/ {4}/g, '\t')
			// To allow HTML tags to be written as text in task names, I
			// replace `<` with `&lt;`, so reverse it (this means if I were
			// type "&amp;lt;" in a task name it would become "<" but that's fine)
			.replace(/&amp;lt;/g, '&lt;');

		if (wrapper.setHTML) {
			wrapper.setHTML(renderedContent);
		} else {
			console.warn('`setHTML` is not supported, so falling back to vulnerable method');
			wrapper.innerHTML = renderedContent;
		}
	}, [content]);

	return <div
		ref={wrapperRef}
		{...passthroughProps}
		class={classNames('content', String(passthroughProps.class))}
	/>;
}
