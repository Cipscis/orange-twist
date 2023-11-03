import { h } from 'preact';
import { forwardRef } from 'preact/compat';

import classNames from 'classnames';

import { type CommandEntry, fireCommand } from '../../registers/commands/commandsRegister';

import { KeyboardShortcutCombos } from '../KeyboardShortcutCombos';
import { CommandPaletteItemName } from './CommandPaletteItemName';

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
		forwardedRef: React.ForwardedRef<HTMLButtonElement>
	) {
		const {
			commandEntry,
			query,
			queryPattern,
			isActive,

			closeCommandPalette,
		} = props;

		return <button
			type="button"
			ref={forwardedRef}
			id={commandEntry.commandInfo.id}
			class={classNames({
				'command-palette__option': true,
				'command-palette__option--active': isActive,
			})}
			onClick={() => {
				closeCommandPalette();
				fireCommand(commandEntry.commandInfo.id);
			}}
		>
			<CommandPaletteItemName
				name={commandEntry.commandInfo.name}
				query={query}
				queryPattern={queryPattern}
			/>
			<span class="content">
				{commandEntry.shortcuts.map((shortcut, i) => (
					<KeyboardShortcutCombos
						key={i}
						keyboardShortcutName={shortcut}
					/>
				))}
			</span>
		</button>;
	}
);
