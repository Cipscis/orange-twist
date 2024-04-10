import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

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

	/** Update the name. */
	const nameChangeHandler = useCallback((newName: string | null) => {
		if (!templateInfo) {
			return;
		}

		const name = newName ?? '';
		setTemplateInfo(templateInfo.id, { name });
	}, [templateInfo]);

	const updateTemplate = useCallback<
		JSX.GenericEventHandler<HTMLTextAreaElement>
	>((e) => {
		if (!templateInfo) {
			return;
		}

		const template = e.currentTarget.value;

		setTemplateInfo(templateInfo.id, { template });
	}, [templateInfo]);

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

	// TODO: Re-render Markup components when templates are changed
	// TODO: Styling
	return <div class="template">
		{/* TODO: Apply constraint to name - lowercase and only \w- characters */}
		{/* Should templates have a display name and a name to use generated from that?
		e.g. "Template A" for a display name becomes "template-a" to actually use? */}
		<InlineNote
			note={templateInfo.name}
			onNoteChange={nameChangeHandler}
			saveChanges={saveChanges}

			placeholder="Template name"
			editButtonTitle="Edit template name"

			class="template__name"
		/>

		<textarea
			class="template__definition"
			onChange={updateTemplate}
		>{templateInfo.template}</textarea>

		<div class="template__actions">
			<Button
				onClick={deleteThisTemplate}
				variant={ButtonVariant.SECONDARY}
			>Delete</Button>
		</div>
	</div>;
}
