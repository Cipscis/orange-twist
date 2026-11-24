import { useEffect } from 'preact/hooks';

import { exportBackup } from 'database';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

/**
 * Register the "Export data" command.
 */
export function useCommandDataExport(): void {
	useEffect(() => {
		registerCommand(Command.DATA_EXPORT, { name: 'Export data' });
	}, []);

	useCommand(Command.DATA_EXPORT, exportBackup);
}
