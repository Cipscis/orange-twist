import type { TokenizerAndRendererExtension } from 'marked';

// TODO: Make templates user-editable
// TODO: Keep the templates map up to date as templates are changed
const templatesMap = new Map<string, string>([
	['template', 'first arg: "{{{0}}}", second arg: "{{{1|default}}}", first again: "{{{0|default this time}}}"'],
	['another-template', 'this is another template'],
	['issue', '[GitHub issue {{{0}}}](https://github.com/Cipscis/orange-twist/issues/{{{0}}})'],
	['pr', '[PR {{{0}}}](https://github.com/Cipscis/orange-twist/pull/{{{0}}})'],
	['em', '*{{{0}}}*'],
]);

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
		const rule = /^(\{\{([\w-]+)(\|(.+))?}})/;
		const match = rule.exec(src);
		if (!match) {
			return;
		}

		const name = match[2];
		const template = templatesMap.get(name.toLocaleLowerCase());

		if (typeof template === 'undefined') {
			return;
		}

		const args = match[4]?.split('|') ?? [];

		let output = template;

		// Convert all {{{0|default}}} slots into numbers e.g. 0,
		// for matching with the appropriately indexed arg
		// TODO: Allow slots in default values, e.g. {{{1|PR {{{0}}}}}}
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
