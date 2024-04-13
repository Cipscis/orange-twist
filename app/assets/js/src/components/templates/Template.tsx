import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
} from 'preact/hooks';

import { getTemplateAlias } from 'utils';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	deleteTemplate,
	setTemplateInfo,
	useTemplateInfo,
} from 'data';

import * as ui from 'ui';
import {
	Button,
	ButtonVariant,
	InlineNote,
	Markdown,
} from 'components/shared';

interface TemplateProps {
	id: number;
}

/**
 * Renders a single template, and allows for it to be edited.
 */
export function Template(props: TemplateProps): JSX.Element | null {
	const { id } = props;
	const templateInfo = useTemplateInfo(id);

	const definitionRef = useRef<HTMLTextAreaElement>(null);

	/**
	 * Save any changes to the name.
	 *
	 * If there is no template name, delete the template.
	 */
	const saveChanges = useCallback(() => {
		if (!templateInfo) {
			return;
		}

		if (templateInfo.name === '') {
			deleteTemplate(templateInfo.id);
		}
		fireCommand(Command.DATA_SAVE);
	}, [templateInfo]);

	const nameChangeHandler = useCallback((newName: string | null) => {
		if (!templateInfo) {
			return;
		}

		const name = newName ?? '';
		setTemplateInfo(templateInfo.id, { name });
	}, [templateInfo]);

	const definitionChangeHandler = useCallback<
		JSX.GenericEventHandler<HTMLTextAreaElement>
	>((e) => {
		if (!templateInfo) {
			return;
		}

		const template = e.currentTarget.value;

		setTemplateInfo(templateInfo.id, { template });
	}, [templateInfo]);

	// Save data when definition is changed
	useEffect(() => {
		if (!definitionRef.current) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		// Bind a "change" event handler. Can't use onChange because preact/compat makes
		// Preact follow React's bone-headed way of binding that to "input" events instead
		definitionRef.current.addEventListener(
			'change',
			() => fireCommand(Command.DATA_SAVE),
			{ signal }
		);

		return () => controller.abort();
	}, []);

	const deleteThisTemplate = useCallback(async () => {
		if (!templateInfo) {
			return;
		}

		if (await ui.confirm('Are you sure you want to delete this template?')) {
			deleteTemplate(templateInfo.id);
		}
	}, [templateInfo]);

	if (!templateInfo) {
		return null;
	}

	const previewArgs: string = (() => {
		const argsUsed = templateInfo.template.match(/{{{\d+(\|[^}]+)?}}}/g);
		if (argsUsed === null) {
			return '';
		}
		let highestArg = -Infinity;
		for (const arg of argsUsed) {
			const argInner = arg.replace(/{{{(\d+)(\|[^}]+)?}}}/, '$1');
			const argNum = Number(argInner);
			if (argNum > highestArg) {
				highestArg = argNum;
			}
		}

		// Don't preview more than 5 args
		highestArg = Math.min(highestArg, 5);

		const argValues = (new Array(highestArg+1)).fill(0).map((val, i) => `arg${i}`);
		return `|${argValues.join('|')}`;
	})();

	const previewMd = `{{${getTemplateAlias(templateInfo.name)}${previewArgs}}}`;

	return <div class="template">
		<InlineNote
			note={templateInfo.name}
			onNoteChange={nameChangeHandler}
			saveChanges={saveChanges}

			placeholder="Template name"
			editButtonTitle="Edit template name"

			class="template__name"
		/>

		<div class="template__actions">
			<Button
				onClick={deleteThisTemplate}
				variant={ButtonVariant.SECONDARY}
			>Delete</Button>
		</div>

		<textarea
			class="template__definition"
			onChange={definitionChangeHandler}
			ref={definitionRef}
		>{templateInfo.template}</textarea>

		<span class="template__alias">{previewMd}</span>
		<Markdown
			class="template__preview"
			content={previewMd}
		/>
	</div>;
}
