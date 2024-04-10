import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import {
	Button,
	Modal,
} from '../shared';

import { createTemplate, useAllTemplateInfo } from 'data';

import { TemplatesList } from './TemplatesList';

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

	const allTemplateInfoUnsorted = useAllTemplateInfo();
	const allTemplateInfo = allTemplateInfoUnsorted.toSorted(
		(a, b) => a.sortIndex - b.sortIndex
	);

	const addNewTemplate = useCallback(() => createTemplate(), []);

	// TODO: Styling/layout
	return <Modal
		open={open}
		onClose={onClose}
		title="Edit templates"
		closeButton
	>
		<p>Put some stuff here</p>

		<TemplatesList templates={allTemplateInfo} />

		<Button onClick={addNewTemplate}>Add new template</Button>
	</Modal>;
}
