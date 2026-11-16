import type { DefaultsFor } from 'utils/DefaultsFor';
import { render, type RenderOptions } from './render';

export type RenderInlineOptions = Pick<RenderOptions, 'allowTemplates'>;

const defaults = {
	allowTemplates: true,
} as const satisfies DefaultsFor<RenderInlineOptions>;

/**
 * Renders the first line of a markdown string into an HTML string.
 *
 * `[[123]]` type task link shortcodes will not be converted, and any HTML tags will be converted to text instead of being left as tags.
 */
export async function renderInline(
	string: string,
	options?: RenderInlineOptions,
): Promise<string> {
	return render(string, {
		...options,
		...defaults,

		inline: true,
		allowLessThanSymbol: true,
		allowTaskLinks: false,
	});
}
