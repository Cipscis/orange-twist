import { h, type JSX } from 'preact';
import { renderToStaticMarkup } from 'preact-render-to-string';

import type { TokenizerAndRendererExtension } from 'marked';

import { useTaskInfo } from 'data';
import { TaskStatusSymbol } from 'types/TaskStatus';

interface TaskLinkProps {
	taskId: number;
}

/**
 * Task link component rendered by Preact for ease of maintenance,
 * always rendered as static markup so it can be used by Marked.
 */
function TaskLink(props: TaskLinkProps): JSX.Element {
	const { taskId } = props;

	const taskInfo = useTaskInfo(taskId);

	if (!taskInfo) {
		return <span class="task-link task-link--invalid">No task with ID {taskId}</span>;
	}

	return <a
		href={`/task?id=${taskId}`}
		class="task-link"
	>
		<span class="task-link__status">{TaskStatusSymbol[taskInfo.status]}</span>
		<span class="task-link__name">{taskInfo.name}</span>
	</a>;
}

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
		const taskLink = renderToStaticMarkup(<TaskLink
			taskId={Number(token.taskId)}
		/>);

		const remainder = this.parser.parseInline(token.tokens ?? []);
		return `${taskLink}${remainder}`;
	},
};