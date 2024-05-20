import {
	h,
	type JSX,
	type RefObject,
} from 'preact';

import { classNames } from 'utils';

import { fireCommand } from 'registers/commands';
import type { CommandInfo } from 'registers/commands/types/CommandInfo';


import { KeyboardShortcutCombos } from '../shared';
import { CommandPaletteItemName } from './CommandPaletteItemName';

interface CommandPaletteItemProps {
	commandInfo: CommandInfo;
	query: string;
	queryPattern: RegExp | null;
	isActive: boolean;
	forwardedRef: RefObject<HTMLButtonElement>;

	closeCommandPalette: () => void;
}

export function CommandPaletteItem(props: CommandPaletteItemProps): JSX.Element {
	const {
		commandInfo,
		query,
		queryPattern,
		isActive,

		closeCommandPalette,

		forwardedRef,
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
		{
			commandInfo.shortcuts.size > 0 &&
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
		}
	</button>;
}
