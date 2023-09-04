import { RefObject, createRef, h } from 'preact';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'preact/hooks';

import htm from 'htm';

import classNames from 'classnames';

import { escapeRegExpString } from '../util/index.js';

import { fireCommand, useCommands } from '../registers/commands/index.js';

import { KeyboardShortcutCombos } from './KeyboardShortcutCombos.js';

// Initialise htm with Preact
const html = htm.bind(h);

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
				query.replace(/./g, '($&)(.*?)')
			)
		}$`, 'i');
	}, [query]);
	const matchingCommands = useMemo(() => {
		if (queryPattern === null) {
			return commands;
		}

		return commands.filter((command) => queryPattern.test(command.commandInfo.name));
	}, [commands, queryPattern]);

	const optionsRef = useRef<RefObject<HTMLElement>[]>([]);
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

	return html`
		${
			open &&
			html`
				<div class="command-palette">
					<div>
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

								onBlur="${onClose}"
							/>
						</div>
						<div
							id="command-palette__options"
							class="command-palette__options"
							role="listbox"
						>
							${matchingCommands.map((command, i) => {
								// Determine how to display the command name based on the current query
								const nameDisplay = (() => {
									if (queryPattern === null) {
										return command.commandInfo.name;
									}

									const match = command.commandInfo.name.match(queryPattern);
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
										key="${command.commandInfo.id}"
										type="button"
										ref="${optionsRef.current[i]}"
										id="${command.commandInfo.id}"
										class="${classNames({
											'command-palette__option': true,
											'command-palette__option--active': activeDescendant !== null && optionsRef.current[i].current === activeDescendant,
										})}"
										onClick="${() => {
											if (onClose) {
												onClose();
											}
											fireCommand(command.commandInfo.id);
										}}"
									>
										${nameDisplay}
										<!-- TODO: This needs tidying up.
										Perhaps instead of getting all info for a command and keyboard
										shortcut, just allow a list of shortcuts to be retrieved? -->
										<span class="content">
											${command.shortcuts.map((shortcut) => html`
												<${KeyboardShortcutCombos} keyboardShortcutName="${shortcut}" />
											`)}
										</span>
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
