import { h, type JSX } from 'preact';

import { useKeyboardShortcuts } from '../registers/keyboard-shortcuts';

import {
	KeyboardShortcutCombos,
	Modal,
} from './shared';

interface KeyboardShortcutsModalProps {
	/** The KeyboardShortcutsModal is only rendered when `open` is `true`. */
	open: boolean;

	/**
	 * Called when internal behaviour determines that the KeyboardShortcutsModal
	 * should be closed. Can be used in the parent component to
	 * update the `open` prop.
	 *
	 * @example
	 * ```tsx
	 * const [open, setOpen] = useState(false);
	 *
	 * return <KeyboardShortcutsModal
	 *     open={open}
	 *     onClose={() => setOpen(false)}
	 * />;
	 * ```
	 */
	onClose: () => void;
}



/**
 * Renders a keyboard shortcuts modal, which displays
 * information about all bound keyboard shortcuts.
 *
 * This component is only intended to be used once per page.
 */
export function KeyboardShortcutModal(props: KeyboardShortcutsModalProps): JSX.Element {
	const {
		open,
		onClose,
	} = props;

	const keyboardShortcutsInfo = useKeyboardShortcuts();

	return <Modal
		open={open}
		onClose={onClose}
		title="Keyboard shortcuts"
		closeButton
	>
		<dl class="keyboard-shortcuts__list">
			{keyboardShortcutsInfo
				.filter(({ shortcuts }) => shortcuts.length > 0)
				.map((keyboardShortcutInfo) => (
					<div
						key={keyboardShortcutInfo.name}
						class="keyboard-shortcuts__item"
					>
						<dt class="keyboard-shortcuts__item__name">{keyboardShortcutInfo.name}</dt>

						<dd class="keyboard-shortcuts__item__combos">
							<KeyboardShortcutCombos
								keyboardShortcutName={keyboardShortcutInfo.name}
							/>
						</dd>
					</div>
				))}
		</dl>
	</Modal>;
}
