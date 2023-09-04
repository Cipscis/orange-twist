import { RefObject, createRef, h } from 'preact';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import { escapeRegExpString } from '../../util/index.js';

import { fireCommand, useCommands } from '../../registers/commands/index.js';

import { CommandPaletteItem } from './CommandPaletteItem.js';

interface CommandPaletteProps {
	open: boolean;

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

	// Handle opening and closing
	useEffect(() => {
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (open) {
			setQuery('');
			fieldRef.current?.focus();
			document.addEventListener('keydown', closeOnEscape);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', closeOnEscape);
			}
		};
	}, [open, onClose]);

	// Handle active descendant management.
	useEffect(() => {
		const adjustActiveDescendant = (e: KeyboardEvent) => {
			if (!(e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
				return;
			}

			e.preventDefault();

			if (activeDescendant) {
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

					return;
				}
			}

			// Set it to the first or last, based on what was pressed
			if (e.key === 'ArrowDown') {
				setActiveDescendant(optionsRef.current[0].current);
			} else {
				setActiveDescendant(optionsRef.current[optionsRef.current.length - 1].current);
			}
		};

		const selectActiveDescendant = (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				if (activeDescendant) {
					e.preventDefault();
					activeDescendant.click();
				} else if (matchingCommands.length === 1) {
					fireCommand(matchingCommands[0].commandInfo.id);
				}
			}
		};

		if (open) {
			document.addEventListener('keydown', adjustActiveDescendant);
			document.addEventListener('keydown', selectActiveDescendant);
		} else {
			setActiveDescendant(null);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', adjustActiveDescendant);
				document.removeEventListener('keydown', selectActiveDescendant);
			}
		};
	}, [open, activeDescendant, matchingCommands]);

	return <>
		{
			open &&
			<div class="command-palette">
				<div>
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

							onBlur={onClose}
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
			</div>
		}
	</>;
}
