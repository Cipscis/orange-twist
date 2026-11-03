import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
	useRef,
} from 'preact/hooks';

import type { Template } from 'database';

import { getTemplateAlias } from 'utils/getTemplateAlias';

import * as ui from 'ui';
import {
	Button,
	ButtonVariant,
	InlineNote,
	Markdown,
} from 'components/shared';

export interface TemplateSyncProps {
	template: Template;
	setTemplate: (data: Partial<Template>) => Promise<void>;
}

/**
 * Renders a complete view of a template, allowing its name and template to be changed.
 */
export function TemplateSync(props: TemplateSyncProps): JSX.Element {
	const {
		template,
		setTemplate,
	} = props;

	const definitionRef = useRef<HTMLTextAreaElement>(null);

	/**
	 * Update the name, and save any changes to it.
	 *
	 * If there is no template name, delete the template.
	 */
	const nameChangeHandler = useCallback((newName: string | null) => {
		const name = newName ?? '';
		if (newName === '') {
			// Just revert the name if it's removed
			return;
		}

		setTemplate({ name });
	}, [setTemplate]);

	/**
	 * Save data when the definition is changed.
	 */
	const definitionChangeHandler = useCallback(() => {
		const textarea = definitionRef.current;
		if (!textarea) {
			return;
		}

		setTemplate({ template: textarea.value });
	}, [setTemplate]);

	const deleteThisTemplate = useCallback(async () => {
		if (await ui.confirm('Are you sure you want to delete this template?')) {
			// TODO: Allow deleting a template
			// deleteTemplate(template.id);
		}
	}, []);

	const previewArgs = useMemo(() => {
		const argsUsed = template.template.match(/{{{\d+(\|[^}]+)?}}}/g);
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
	}, [template.template]);

	const previewMd = `{{${getTemplateAlias(template.name)}${previewArgs}}}`;

	return <div class="template">
		<InlineNote
			note={template.name}
			onNoteChange={nameChangeHandler}

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
		>{template.template}</textarea>

		{/* TODO: Display live preview */}
		<span class="template__alias">{previewMd}</span>

		{/* TODO: Display live preview */}
		<Markdown
			class="template__preview"
			content={previewMd}
		/>
	</div>;
}
