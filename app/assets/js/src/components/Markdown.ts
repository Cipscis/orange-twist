import { h } from 'preact';
import htm from 'htm';

import { marked } from 'marked';
import { useLayoutEffect, useRef } from 'preact/hooks';

// Initialise htm with Preact
const html = htm.bind(h);

export interface MarkdownProps {
	content: string;
}

export function Markdown(props: MarkdownProps) {
	const {
		content,
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			return;
		}

		const renderedContent = marked.parse(content, { mangle: false, headerIds: false });
		wrapper.setHTML(renderedContent);
	}, [content]);

	return html`<div
		ref="${wrapperRef}"
		class="content"
	></div>`;
}
