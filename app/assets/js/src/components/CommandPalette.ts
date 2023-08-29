import { RefObject, createRef, h } from 'preact';
import htm from 'htm';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';
import classNames from 'classnames';
import { useCommands } from '../registers/commands/hooks/useCommands.js';
import { fireCommand } from '../registers/commands/commandsRegister.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface CommandPaletteProps {
	open: boolean;

	onClose?: () => void;
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
	// TODO: Escape query before using it
	/** Fuzzy match, with groups for all non-matching sequences */
	const queryPattern = useMemo(() => {
		if (query === '') {
			return null;
		}

		return new RegExp(`^(.*?)${query.replace(/./g, '($&)(.*?)')}$`, 'i');
	}, [query]);
	const matchingCommands = useMemo(() => {
		if (queryPattern === null) {
			return commands;
		}

		return commands.filter((command) => queryPattern.test(command.name));
	}, [commands, queryPattern]);

	const optionsRef = useRef<RefObject<HTMLElement>[]>([]);
	optionsRef.current = matchingCommands.map((command, i) => optionsRef.current[i] ?? createRef<HTMLElement>());

	// Handle opening, closing, and active descendant management.
	useEffect(() => {
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && onClose) {
				onClose();
			}
		};

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
			if (e.key === 'Enter' && activeDescendant) {
				e.preventDefault();
				activeDescendant.click();
			}
		};

		if (open) {
			fieldRef.current?.focus();
			document.addEventListener('keydown', closeOnEscape);
			document.addEventListener('keydown', adjustActiveDescendant);
			document.addEventListener('keydown', selectActiveDescendant);
		} else {
			setActiveDescendant(null);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', closeOnEscape);
				document.removeEventListener('keydown', adjustActiveDescendant);
				document.removeEventListener('keydown', selectActiveDescendant);
			}
		};
	}, [open, activeDescendant]);

	return html`
		${
			open &&
			html`
				<div class="command-palette">
					<div>
						<!-- TODO: Make the input actually work for fuzzy search etc. -->
						<div class="command-palette__field">
							<input
								ref="${fieldRef}"
								type="text"
								class="command-palette__field-input"

								aria-role="combobox"
								aria-expanded="true"
								aria-haspopoup="listbox"
								aria-controls="command-palette__options"
								aria-activedescendant="${activeDescendant?.id ?? null}"

								onInput="${(e: InputEvent) => {
									// This type assertion is safe because we know the event fired on an input
									setQuery((e.target as HTMLInputElement).value);
								}}"
							/>
						</div>
						<div
							id="command-palette__options"
							class="command-palette__options"
							role="listbox"
						>
							${matchingCommands.map((command, i) => {
								const nameDisplay = (() => {
									if (queryPattern === null) {
										return command.name;
									}

									const match = command.name.match(queryPattern);
									if (match === null) {
										return null;
									}

									// Convert match into matched and unmatched tokens
									const tokens: Array<{ string: string, match: boolean; }> = [];
									let queryIndex = 0;
									for (const token of match.slice(1)) {
										// Step through groups, keeping track of our position in the query
										const remainingQuery = query.substring(queryIndex).toLowerCase();
										if (remainingQuery.indexOf(token.toLowerCase()) === 0) {
											// If this group is next in the query, it's part of the match and we should advance our position in the query
											queryIndex += token.length;

											const lastToken = tokens.at(-1);
											if (lastToken?.match === true) {
												// The last part was a match too, so append it
												lastToken.string += token;
											} else {
												// Make a new matched token
												tokens.push({ string: token, match: true });
											}
										} else {
											// Otherwise, it's a non-match
											tokens.push({ string: token, match: false });
										}
									}

									const nameDisplay = html`${tokens.map((token) => {
										return token.match
											? html`<b>${token.string}</b>`
											: token.string;
									})}`;
									return nameDisplay;
								})();

								if (nameDisplay === null) {
									return null;
								}

								return html`
									<button
										key="${command.id}"
										type="button"
										ref="${optionsRef.current[i]}"
										id="${command.id}"
										class="${classNames({
											'command-palette__option': true,
											'command-palette__option--active': activeDescendant !== null && optionsRef.current[i].current === activeDescendant,
										})}"
										onClick="${() => {
											if (onClose) {
												onClose();
											}
											fireCommand(command.id);
										}}"
									>
										${nameDisplay}
									</button>
								`;
							})}
						</div>
					</div>
				</div>
			`
		}
	`;
}
