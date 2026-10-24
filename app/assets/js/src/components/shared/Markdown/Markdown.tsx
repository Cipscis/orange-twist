import type Preact from 'preact';
import {
	h,
	type JSX,
	type RefObject,
} from 'preact';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { classNames } from 'utils';
import { render, renderInline } from 'utils/markdown';

import { useAllTemplateInfo } from 'data';
import { consumeAllImageUrlPlaceholders } from 'images';

/**
 * An externally accessible API exposed through a forwarded ref prop.
 */
export interface MarkdownApi {
	/** Force Markdown content to re-render. */
	rerender(): void;
}

interface MarkdownProps extends Preact.HTMLAttributes<HTMLDivElement> {
	/**
	 * The markdown content to be rendered as HTML.
	 */
	content: string;

	/**
	 * If a ref object is provided, it will be set to expose
	 * a {@linkcode MarkdownApi} object.
	 *
	 * @example
	 * ```typescript
	 * // Some external data that affects Markdown results
	 * const externalData = useExternalData();
	 *
	 * const markdownApiRef = useRef<MarkdownApi | null>(null);
	 *
	 * // Rerender Markdown content when external data changes
	 * useEffect(() => {
	 *     markdownApiRef.current?.rerender();
	 * }, [externalData])
	 *
	 * return <Markdown
	 *     content={props.content}
	 *     apiRef={markdownApiRef}
	 * />
	 * ```
	 */
	apiRef?: RefObject<MarkdownApi>;

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
		apiRef,
		inline,
		...passthroughProps
	} = props;

	const wrapperRef = useRef<HTMLDivElement>(null);

	// Re-render whenever a template changes
	const templates = useAllTemplateInfo();

	const [renderSwitch, setRenderSwitch] = useState(false);
	/**
	 * Force the Markdown content to re-render.
	 */
	const rerender = useCallback(() => {
		setRenderSwitch(!renderSwitch);
	}, [renderSwitch]);

	// Expose API
	useEffect(() => {
		if (apiRef) {
			apiRef.current = { rerender };
		}
	}, [apiRef, rerender]);

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
				wrapper.setHTML(content);
			} else {
				// This fallback still exists because, as of 2026-10-24, Safari has not shipped Element.setHTML
				wrapper.setHTMLUnsafe(content);
			}
		});

		(async () => {
			const renderedContent = await (async () => {
				if (inline) {
					return renderInline(content);
				}

				return render(content);
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
		templates,
		renderSwitch,
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
