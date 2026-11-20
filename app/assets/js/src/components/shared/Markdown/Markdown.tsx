import type Preact from 'preact';
import {
	h,
	type JSX,
} from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { classNames } from 'utils';
import {
	render,
	renderInline,
	type RenderInlineOptions,
} from 'utils/markdown';

import { consumeAllImageUrlPlaceholders } from 'images';

import { getSanitiser } from 'custom-elements/getSanitiser';

interface MarkdownProps extends Preact.HTMLAttributes<HTMLDivElement> {
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
	options?: RenderInlineOptions;
}

export function Markdown(props: MarkdownProps): JSX.Element {
	const {
		content,
		inline,
		options,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	// Render content as markup
	// Using `useLayoutEffect` prevents jittering caused by setting HTML after Preact renders
	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) {
			// The wrapper should always be set by this point
			/* istanbul ignore next */
			return;
		}

		const updateRenderedContent = ((content: string) => {
			if (wrapper.setHTML) {
				wrapper.setHTML(content, { sanitizer: getSanitiser() });
			} else {
				// This fallback still exists because, as of 2026-10-24, Safari has not shipped Element.setHTML
				wrapper.setHTMLUnsafe(content);
			}
		});

		(async () => {
			const renderedContent = await (async () => {
				if (inline) {
					return renderInline(content, options);
				}

				return render(content, options);
			})();

			updateRenderedContent(renderedContent);

			if (!inline) {
				// Asynchronously replace image URLs
				const renderedContentWithImages = await consumeAllImageUrlPlaceholders(renderedContent);
				if (renderedContentWithImages !== renderedContent) {
					updateRenderedContent(renderedContentWithImages);
				}
			}
		})();
	}, [
		content,
		inline,
		options,
	]);

	return <div
		ref={wrapperRef}
		{...passthroughProps}
		class={classNames(
			'content',
			// This type assertion MAY NOT BE SAFE but I'm not using Signals currently
			passthroughProps.class && String(passthroughProps.class as string)
		)}
	/>;
}
