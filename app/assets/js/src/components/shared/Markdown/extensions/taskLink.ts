import type { TokenizerAndRendererExtension } from 'marked';

import { getTaskInfo } from 'data';
import { TaskStatusSymbol } from 'types/TaskStatus';

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
		const rule = /^(\[\[(\d+)\]\])(.*?)(?:$|\n)/;
		const match = rule.exec(src);
		if (!match) {
			return undefined;
		}

		const token = {
			type: 'taskLink',
			raw: match[0],
			taskId: match[2],
			remainder: match[3],
			tokens: [],
		};
		// Tell the lexer to parse anything in the remainder
		this.lexer.inline(token.remainder, token.tokens);
		return token;
	},
	renderer(token) {
		const taskLink = (() => {
			const taskId = Number(token.taskId);
			if (isNaN(taskId)) {
				// TODO: Needs styling
				return `Invalid task ID ${token.taskId}`;
			}

			const taskInfo = getTaskInfo(taskId);
			if (!taskInfo) {
				// TODO: Needs styling
				return `No task with ID ${taskId}`;
			}

			// TODO: Needs styling
			const taskLink = `<a href="/task?id=${token.taskId}" class="task-link"><span class="task-link__status">${TaskStatusSymbol[taskInfo.status]}</span> <span class="task-link__name">${taskInfo.name}</span></a>`;
			return taskLink;
		})()

		const remainder = this.parser.parseInline(token.tokens ?? []);
		return `${taskLink}${remainder}`;
	},
};