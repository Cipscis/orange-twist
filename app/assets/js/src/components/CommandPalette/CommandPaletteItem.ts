import { h } from 'preact';
import { forwardRef } from 'preact/compat';

import htm from 'htm';
import classNames from 'classnames';

import { CommandEntry, fireCommand } from '../../registers/commands/commandsRegister.js';

import { KeyboardShortcutCombos } from '../KeyboardShortcutCombos.js';
import { CommandPaletteItemName } from './CommandPaletteItemName.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface CommandPaletteItemProps {
	commandEntry: CommandEntry;
	query: string;
	queryPattern: RegExp | null;
	isActive: boolean;

	closeCommandPalette: () => void;
}

export const CommandPaletteItem = forwardRef(
	function CommandPaletteItem(
		props: CommandPaletteItemProps,
		forwardedRef: React.ForwardedRef<HTMLElement>
	) {
		const {
			commandEntry,
			query,
			queryPattern,
			isActive,

			closeCommandPalette,
		} = props;

		// Determine how to display the command name based on the current query
		const nameDisplay = (() => {
			if (queryPattern === null) {
				return commandEntry.commandInfo.name;
			}

			const match = commandEntry.commandInfo.name.match(queryPattern);
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

		return html`
			<button
				type="button"
				ref="${forwardedRef}"
				id="${commandEntry.commandInfo.id}"
				class="${classNames({
					'command-palette__option': true,
					'command-palette__option--active': isActive,
				})}"
				onClick="${() => {
					closeCommandPalette();
					fireCommand(commandEntry.commandInfo.id);
				}}"
			>
				<${CommandPaletteItemName}
					name="${commandEntry.commandInfo.name}"
					query="${query}"
					queryPattern="${queryPattern}"
				/>
				<span class="content">
					${commandEntry.shortcuts.map((shortcut) => html`
						<${KeyboardShortcutCombos}
							keyboardShortcutName="${shortcut}"
						/>
					`)}
				</span>
			</button>
		`;
	}
);
