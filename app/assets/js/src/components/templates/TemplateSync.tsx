import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import { SaveType, type Template } from 'database';

import { getTemplateAlias } from 'utils/getTemplateAlias';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

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
 * Pattern used to find and manipulate arguments in template syntax, e.g. `{{{0}}}`.
 */
const argsPattern = /{{{(\d+)(\|[^}]+)?}}}/g;

/**
 * Renders a complete view of a template, allowing its name and template to be changed.
 */
export function TemplateSync(props: TemplateSyncProps): JSX.Element {
	const {
		template,
		setTemplate,
	} = props;

	const definitionRef = useRef<HTMLTextAreaElement>(null);

	const [previewDefinition, setPreviewDefinition] = useState<string | null>(null);

	/**
	 * Update the name, and save any changes to it.
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
	 * Set a preview override as the definition is being edited.
	 */
	const definitionInputHandler = useCallback(() => {
		const textarea = definitionRef.current;
		if (!textarea) {
			return;
		}

		setPreviewDefinition(textarea.value);
	}, []);

	/**
	 * Save data when the definition is changed.
	 */
	const definitionChangeHandler = useCallback(() => {
		setPreviewDefinition(null);

		const textarea = definitionRef.current;
		if (!textarea) {
			return;
		}

		setTemplate({ template: textarea.value });
	}, [setTemplate]);

	const deleteThisTemplate = useCallback(async () => {
		if (await ui.confirm('Are you sure you want to delete this template?')) {
			fireCommand(Command.DATA_SAVE, [{
				type: SaveType.TEMPLATE_DELETE,
				id: template.id,
			}]);
		}
	}, [template.id]);

	const definition = previewDefinition ?? template.template;
	const previewArgs = useMemo(() => {
		const argsUsed = definition.match(argsPattern);
		if (argsUsed === null) {
			return '';
		}
		let highestArg = -Infinity;
		for (const arg of argsUsed) {
			const argInner = arg.replace(argsPattern, '$1');
			const argNum = Number(argInner);
			if (argNum > highestArg) {
				highestArg = argNum;
			}
		}

		// Don't preview more than 5 args
		highestArg = Math.min(highestArg, 5);

		const argValues = (new Array(highestArg+1)).fill(0).map((val, i) => `arg${i}`);
		return `|${argValues.join('|')}`;
	}, [definition]);

	/** Live preview of raw markdown needed to use a template. */
	const previewMdToShowRaw = `{{${getTemplateAlias(template.name)}${previewArgs}}}`;
	/** Live preview of markdown that is rendered to show how a template looks. Replaces variable notation from the definition (e.g. '{{{0}}}') with an example value (e.g. 'arg0'). */
	const previewMdToRender = definition
		.replace(argsPattern, 'arg$1');

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
			onInput={definitionInputHandler}
			onChange={definitionChangeHandler}
			ref={definitionRef}
		>{template.template}</textarea>

		<span class="template__alias">{previewMdToShowRaw}</span>

		<Markdown
			class="template__preview"
			content={previewMdToRender}
		/>
	</div>;
}
