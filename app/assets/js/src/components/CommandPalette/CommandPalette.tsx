import { type RefObject, createRef, h } from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import { escapeRegExpString } from '../../util';

import { fireCommand, useCommands } from '../../registers/commands';

import { Modal } from '../shared/Modal';
import { CommandPaletteItem } from './CommandPaletteItem';

interface CommandPaletteProps {
	/** The CommandPallete is only rendered when `open` is `true`. */
	open: boolean;

	/**
	 * Called when internal behaviour determines that the CommandPalette
	 * should be closed. Can be used in the parent component to
	 * update the `open` prop.
	 *
	 * @example
	 * ```tsx
	 * const [open, setOpen] = useState(false);
	 *
	 * return <CommandPalette
	 *     open={open}
	 *     onClose={() => setOpen(false)}
	 * />;
	 * ```
	 */
	onClose: () => void;
}

export function CommandPalette(props: CommandPaletteProps) {
	const {
		open,
		onClose,
	} = props;

	const fieldRef = useRef<HTMLInputElement>(null);

	const commands = useCommands();

	const [activeDescendant, setActiveDescendant] = useState<HTMLElement | null>(null);

	const [query, setQuery] = useState('');
	/** Fuzzy match, with groups for all non-matching sequences */
	const queryPattern = useMemo(() => {
		if (query === '') {
			return null;
		}

		return new RegExp(`^(.*?)${
			escapeRegExpString(
				query
			).replace(/\\?[^\\]/g, '($&)(.*?)')
		}$`, 'i');
	}, [query]);
	const matchingCommands = useMemo(() => {
		if (queryPattern === null) {
			return commands;
		}

		return commands.filter((command) => queryPattern.test(command.commandInfo.name));
	}, [commands, queryPattern]);

	const optionsRef = useRef<RefObject<HTMLButtonElement>[]>([]);
	optionsRef.current = matchingCommands.map((command, i) => optionsRef.current[i] ?? createRef<HTMLElement>());

	// Handle active descendant management.
	useEffect(() => {
		if (!open) {
			setActiveDescendant(null);
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		// Adjust active descendent
		document.addEventListener('keydown', (e) => {
			if (!(e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
				return;
			}

			e.preventDefault();

			if (!activeDescendant) {
				// Set it to the first or last, based on what was pressed
				if (e.key === 'ArrowDown') {
					setActiveDescendant(optionsRef.current[0].current);
				} else {
					setActiveDescendant(optionsRef.current[optionsRef.current.length - 1].current);
				}
			}

			// Find existing index, modify it, then update `activeDescendant`
			const currentActiveDescendantIndex = optionsRef.current.findIndex((ref) => ref.current === activeDescendant);
			if (currentActiveDescendantIndex !== -1) {
				// Set new `activeDescendant`
				const numOptions = optionsRef.current.length;
				if (e.key === 'ArrowDown') {
					const newActiveDescendantIndex = (currentActiveDescendantIndex + 1) % numOptions;
					setActiveDescendant(optionsRef.current[newActiveDescendantIndex].current);
				} else {
					const newActiveDescendantIndex = (currentActiveDescendantIndex + numOptions - 1) % numOptions;
					setActiveDescendant(optionsRef.current[newActiveDescendantIndex].current);
				}
			}
		}, { signal });

		// Activate selected descendant
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				if (activeDescendant) {
					e.preventDefault();
					activeDescendant.click();
				} else if (matchingCommands.length === 1) {
					fireCommand(matchingCommands[0].commandInfo.id);
					onClose();
				}
			}
		}, { signal });

		return () => controller.abort();
	}, [open, activeDescendant, matchingCommands, onClose]);

	// Clear active descendant if it's no longer in the list of matched commands
	useEffect(() => {
		if (!activeDescendant) {
			return;
		}

		const activeDescendantId = activeDescendant.getAttribute('id');
		const activeDescendantIsVisible = Boolean(matchingCommands.find(
			({ commandInfo: { id } }) => id === activeDescendantId
		));

		if (!activeDescendantIsVisible) {
			setActiveDescendant(null);
		}
	}, [activeDescendant, matchingCommands]);

	/**
	 * Set up initial state when the command palette is opened.
	 */
	const onOpen = useCallback(() => {
		setActiveDescendant(null);
		setQuery('');
		fieldRef.current?.focus();
	}, []);

	return <Modal
		open={open}
		onOpen={onOpen}
		onClose={onClose}
		class="command-palette"
	>
		<div data-testid="command-palette">
			<div class="command-palette__field">
				<input
					ref={fieldRef}
					type="text"
					class="command-palette__field-input"

					aria-role="combobox"
					aria-expanded="true"
					aria-haspopoup="listbox"
					aria-controls="command-palette__options"
					aria-activedescendant={activeDescendant?.id ?? undefined}

					onInput={(e) => {
						setQuery(e.currentTarget.value);
					}}
				/>
			</div>
			<div
				id="command-palette__options"
				class="command-palette__options"
				role="listbox"
			>
				{matchingCommands.map((command, i) => (
					<CommandPaletteItem
						key={command.commandInfo.id}
						ref={optionsRef.current[i]}

						commandEntry={command}
						query={query}
						queryPattern={queryPattern}
						isActive={activeDescendant !== null && optionsRef.current[i].current === activeDescendant}

						closeCommandPalette={() => {
							if (onClose) {
								onClose();
							}
						}}
					/>
				))}
			</div>
		</div>
	</Modal>;
}
