import {
	type RefObject,
	createRef,
	h,
	type JSX,
} from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import { escapeRegExpString } from 'utils';

import { fireCommand, useCommandInfo } from 'registers/commands';

import { Modal } from '../shared';
import { CommandPaletteItem } from './CommandPaletteItem';

interface CommandPaletteProps {
	/** The CommandPalette is only rendered when `open` is `true`. */
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

/**
 * A modal window that lists all registered commands, displaying their
 * names and any keyboard shortcuts bound to them. Registered commands
 * can be filtered and activated in this command palette.
 */
export function CommandPalette(props: CommandPaletteProps): JSX.Element {
	const {
		open,
		onClose,
	} = props;

	const fieldRef = useRef<HTMLInputElement>(null);

	const allCommandsInfo = useCommandInfo();

	const [activeDescendant, setActiveDescendant] = useState<HTMLElement | null>(null);

	const [query, setQuery] = useState('');
	/**
	 * A regular expression constructed from the query, which can be used for
	 * executing a fuzzy match, with groups for all non-matching sequences.
	 */
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

	/** All commands that match against the current query. */
	const matchingCommands = useMemo(() => {
		if (queryPattern === null) {
			return allCommandsInfo;
		}

		return allCommandsInfo.filter((commandInfo) => queryPattern.test(commandInfo.name));
	}, [allCommandsInfo, queryPattern]);

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

			let newActiveDescendant: HTMLElement | null;
			if (activeDescendant) {
				// Find existing index, modify it, then update `activeDescendant`
				const currentActiveDescendantIndex = optionsRef.current.findIndex(
					(ref) => ref.current === activeDescendant
				);

				if (currentActiveDescendantIndex === -1) {
					newActiveDescendant = null;
				} else {
					// Set new `activeDescendant`
					const numOptions = optionsRef.current.length;
					if (e.key === 'ArrowDown') {
						const newActiveDescendantIndex = (currentActiveDescendantIndex + 1) % numOptions;
						newActiveDescendant = optionsRef.current[newActiveDescendantIndex].current;
					} else {
						const newActiveDescendantIndex = (currentActiveDescendantIndex + numOptions - 1) % numOptions;
						newActiveDescendant = optionsRef.current[newActiveDescendantIndex].current;
					}
				}
			} else {
				// Set it to the first or last, based on what was pressed
				if (e.key === 'ArrowDown') {
					newActiveDescendant = optionsRef.current[0].current;
				} else {
					newActiveDescendant = optionsRef.current[optionsRef.current.length - 1].current;
				}
			}

			setActiveDescendant(newActiveDescendant);
			if (newActiveDescendant) {
				// Scroll into view, but keep the item at the
				// bottom to encourage text input to stay in view
				newActiveDescendant.scrollIntoView({ block: 'end', inline: 'nearest' });
			}
		}, { signal });

		// Activate selected descendant
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				if (activeDescendant) {
					e.preventDefault();
					activeDescendant.click();
				} else if (matchingCommands.length === 1) {
					fireCommand(matchingCommands[0].id);
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
			({ id }) => id === activeDescendantId
		));

		if (!activeDescendantIsVisible) {
			setActiveDescendant(null);
		}
	}, [activeDescendant, matchingCommands]);

	/**
	 * Set up initial state when the command palette is opened.
	 */
	const onOpen = useCallback(() => {
		setQuery('');
		fieldRef.current?.focus();
	}, []);

	return <Modal
		open={open}
		onOpen={onOpen}
		onClose={onClose}
		class="command-palette"
	>
		<div class="command-palette__field" data-testid="command-palette__field">
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
					key={command.id}
					forwardedRef={optionsRef.current[i]}

					commandInfo={command}
					query={query}
					queryPattern={queryPattern}
					isActive={activeDescendant !== null && optionsRef.current[i].current === activeDescendant}

					closeCommandPalette={onClose}
				/>
			))}
		</div>
	</Modal>;
}
