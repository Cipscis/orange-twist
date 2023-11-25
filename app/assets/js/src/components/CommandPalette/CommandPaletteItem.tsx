import { h } from 'preact';
import { forwardRef } from 'preact/compat';

import classNames from 'classnames';

import { fireCommand } from 'registers/commands';
import type { CommandInfo } from 'registers/commands/types/CommandInfo';


import { KeyboardShortcutCombos } from '../shared/KeyboardShortcutCombos';
import { CommandPaletteItemName } from './CommandPaletteItemName';

interface CommandPaletteItemProps {
	commandInfo: CommandInfo;
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
			commandInfo,
			query,
			queryPattern,
			isActive,

			closeCommandPalette,
		} = props;

		return <button
			type="button"
			ref={forwardedRef}
			id={commandInfo.id}
			class={classNames({
				'command-palette__option': true,
				'command-palette__option--active': isActive,
			})}
			onClick={() => {
				closeCommandPalette();
				fireCommand(commandInfo.id);
			}}
		>
			<CommandPaletteItemName
				name={commandInfo.name}
				query={query}
				queryPattern={queryPattern}
			/>
			<span class="content">
				{Array.from(
					commandInfo.shortcuts.values()
				).map((shortcut, i) => (
					<KeyboardShortcutCombos
						key={i}
						keyboardShortcutName={shortcut}
					/>
				))}
			</span>
		</button>;
	}
);
