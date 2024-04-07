import { h, type JSX } from 'preact';

import {
	Button,
	Modal,
} from '../shared';

import { createTemplate, useAllTemplateInfo } from 'data';

import { Template } from './Template';

interface TemplatesModalProps {
	/** The TemplatesModal is only rendered when `open` is `true`. */
	open: boolean;

	/**
	 * Called when internal behaviour determines that the TemplatesModal
	 * should be closed. Can be used in the parent component to
	 * update the `open` prop.
	 *
	 * @example
	 * ```tsx
	 * const [open, setOpen] = useState(false);
	 *
	 * return <TemplatesModal
	 *     open={open}
	 *     onClose={() => setOpen(false)}
	 * />;
	 * ```
	 */
	onClose: () => void;
}

/**
 * Renders a modal that contains a form where the user can edit
 * any custom templates.
 *
 * This component is only intended to be used once per page.
 */
export function TemplatesModal(props: TemplatesModalProps): JSX.Element {
	const {
		open,
		onClose,
	} = props;

	const allTemplateInfo = useAllTemplateInfo();

	return <Modal
		open={open}
		onClose={onClose}
		title="Edit templates"
		closeButton
	>
		<p>Put some stuff here</p>

		{/* TODO: Sort by sortIndex */}
		{/* TODO: Allow sorting */}
		{allTemplateInfo.map(({ id }) => (
			<Template key={id} id={id} />
		))}

		{/* TODO: Clean this up */}
		<Button onClick={() => {
			createTemplate();
		}}
		>Add new template</Button>
	</Modal>;
}
