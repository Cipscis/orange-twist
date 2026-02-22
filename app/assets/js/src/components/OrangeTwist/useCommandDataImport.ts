import { useEffect } from 'preact/hooks';

import { importData } from 'data';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

/**
 * Register the "Import data" command.
 */
export function useCommandDataImport(): void {
	useEffect(() => {
		registerCommand(Command.DATA_IMPORT, { name: 'Import data' });
	}, []);

	useCommand(Command.DATA_IMPORT, importData);
}
