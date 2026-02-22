import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

export interface UseCommandTemplatesEditState {
	templatesModalOpen: boolean;
	/** Open the templates modal. */
	openTemplatesModal: () => void;
	/** Close the templates modal. */
	closeTemplatesModal: () => void;
}

/**
 * Registers the "Edit templates" command.
 */
export function useCommandTemplatesEdit(): UseCommandTemplatesEditState {
	useEffect(() => {
		registerCommand(Command.TEMPLATES_EDIT, { name: 'Edit templates' });
	}, []);

	const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
	/** Open the templates modal. */
	const openTemplatesModal = useCallback(
		() => setTemplatesModalOpen(true),
		[]
	);
	/** Close the templates modal. */
	const closeTemplatesModal = useCallback(
		() => setTemplatesModalOpen(false),
		[],
	);
	useCommand(Command.TEMPLATES_EDIT, openTemplatesModal);

	return {
		templatesModalOpen,
		openTemplatesModal,
		closeTemplatesModal,
	};
}
