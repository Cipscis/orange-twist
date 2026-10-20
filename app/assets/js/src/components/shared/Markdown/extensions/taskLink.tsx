import type { TokenizerAndRendererExtension } from 'marked';

export const taskLink: TokenizerAndRendererExtension = {
	name: 'taskLink',
	level: 'inline',
	start(src) {
		// Tell Marked when to stop and check for a match
		return src.match(/\[\[\d/)?.index;
	},
	tokenizer(src, tokens) {
		// Expression for complete token, from its start
		// Match a number in double square braces, and collect any following text
		// e.g. "[[48]]"
		const rule = /^(\[\[(\d+)\]\])/;
		const match = rule.exec(src);
		if (!match) {
			return undefined;
		}

		const token = {
			type: 'taskLink',
			raw: match[0],
			taskId: match[2],
			tokens: [],
		};
		return token;
	},
	renderer(token) {
		const taskLink = `<task-link task-id="${token.taskId}"></task-link>`;
		return taskLink;
	},
};
