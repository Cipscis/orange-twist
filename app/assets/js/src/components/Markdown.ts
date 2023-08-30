import { h } from 'preact';
import htm from 'htm';

import { marked } from 'marked';
import { useEffect, useRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface MarkdownProps extends JSXInternal.DOMAttributes<HTMLDivElement> {
	content: string;
}

export function Markdown(props: MarkdownProps) {
	const {
		content,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			return;
		}

		const renderedContent = marked
			.parse(content, { mangle: false, headerIds: false })
			// Stupid fucking plugin replaces tabs with spaces
			.replace(/ {4}/g, '\t');
		wrapper.setHTML(renderedContent);
	}, [content]);

	return html`<div
		ref="${wrapperRef}"
		class="content"
		...${passthroughProps}
	></div>`;
}
