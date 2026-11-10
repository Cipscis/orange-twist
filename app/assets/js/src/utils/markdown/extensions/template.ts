import type { TokenizerAndRendererExtension } from 'marked';

import { HTMLMarkdownTemplateElement } from 'custom-elements/HTMLMarkdownTemplateElement';

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
		const args = match[4]?.split('|') ?? [];

		const token = {
			type: 'template',
			raw: match[0],
			name,
			args,
			tokens: [],
		};
		return token;
	},
	renderer(token) {
		if (!customElements.get('markdown-template')) {
			customElements.define('markdown-template', HTMLMarkdownTemplateElement);
		}

		if (!(
			typeof token.name === 'string' &&
			Array.isArray(token.args)
		)) {
			return '';
		}

		const nameAttr = token.name.replace(/"/g, '&quot;');
		const argsAttr = JSON.stringify(token.args)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;');

		return `<markdown-template name="${nameAttr}" args="${argsAttr}"></markdown-template>`;
	},
};
