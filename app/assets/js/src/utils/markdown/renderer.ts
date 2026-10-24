import type { RendererObject } from 'marked';

export const renderer: RendererObject = {
	link(token) {
		const text = this.parser.parseInline(token.tokens);
		const { href, title } = token;

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
};
