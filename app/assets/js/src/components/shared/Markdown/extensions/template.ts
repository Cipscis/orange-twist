import type { TokenizerAndRendererExtension } from 'marked';

import { getTemplateAlias } from 'utils';
import { getAllTemplateInfo } from 'data';

/**
 * Get the template for a given name, if there is one.
 * Case insensitive.
 *
 * If a template's content is an empty string, a default
 * value will be used.
 */
function getTemplateByName(templateName: string): string | null {
	const allTemplateInfo = getAllTemplateInfo();
	const templateInfo = allTemplateInfo.find(
		({ name }) => getTemplateAlias(name) === getTemplateAlias(templateName)
	);

	if (!templateInfo) {
		return null;
	}

	if (templateInfo.template.trim() === '') {
		return '<em>Empty template</em>';
	}

	return templateInfo.template;
}

export const template: TokenizerAndRendererExtension = {
	name: 'template',
	level: 'inline',
	start(src) {
		// Tell Marked when to stop and check for a match
		return src.match(/\{\{/)?.index;
	},
	tokenizer(src, tokens) {
		// Expression for complete token, from its start
		// Match a name in double braces, optionally with one or more parameters separated by pipes
		// e.g. "{{template-name|1|title}}"
		const rule = /^(\{\{([^{|}]+)(\|(.+?))?}})/;
		const match = rule.exec(src);
		if (!match) {
			return;
		}

		const name = match[2];
		const template = getTemplateByName(name);
		if (template === null) {
			return;
		}

		const args = match[4]?.split('|') ?? [];

		let output = template;

		// Convert all {{{0|default}}} slots into numbers e.g. 0,
		// for matching with the appropriately indexed arg
		const slots = (output.match(/\{\{\{\d+(\|.+?)?}}}/g) ?? []).map(
			(slot) => Number(
				slot.replace(
					/\{\{\{(\d+).+/,
					'$1'
				)
			)
		);

		for (const index of slots) {
			const arg = args[index];

			const replacePattern = new RegExp(
				`\\{\\{\\{${index}(\\|(.+?))?}}}`
			);
			const match = output.match(replacePattern);
			if (!match) {
				continue;
			}

			const defaultValue = match[2] ?? '';
			const replaceValue = arg || defaultValue;

			output = output.replace(match[0], replaceValue);
		}

		const token = {
			type: 'template',
			raw: match[0],
			tokens: [],
		};

		this.lexer.inlineTokens(output, tokens);

		return token;
	},
	renderer(token) {
		if (!token.tokens) {
			return '';
		}

		return this.parser.parseInline(token.tokens);
	},
};
