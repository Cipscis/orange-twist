import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	deleteTemplate,
	setTemplateInfo,
	useTemplateInfo,
} from 'data';
import { InlineNote } from 'components/shared';

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

	if (!templateInfo) {
		return null;
	}

	// TODO: Delete template
	// TODO: Allow editing template
	// TODO: Re-render notes when templates are changed

	return <div class="template">
		<InlineNote
			note={templateInfo.name}
			onNoteChange={nameChangeHandler}
			saveChanges={saveChanges}

			placeholder="Template name"
			editButtonTitle="Edit template name"

			class="template__name"
		/>
	</div>;
}
