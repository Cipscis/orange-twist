import { AsyncDataStateType, SettableLiveData } from 'utils/asyncData';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import type { Template } from '../types';

import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';
import { SaveType } from './SaveAction';
import { loadTemplate } from './loadTemplate';

/**
 * Provides live access to a settable template.
 */
export class SettableLiveTemplate extends SettableLiveData<Template> {
	constructor(templateId: number) {
		super({
			optimistic: true,
			async getData(_options) {
				const template = await loadTemplate(templateId);

				if (template === null) {
					throw new Error(`Could not find template with ID ${templateId}`);
				}

				return template;
			},
			async setData(template, _signal) {
				await fireCommand(Command.DATA_SAVE, [{
					type: SaveType.TEMPLATE,
					id: templateId,
					template,
				}]);
			},
			observeState(getData, state, signal) {
				const changeEntity = {
					type: ChangeEntityType.TEMPLATE,
					id: templateId,
				};

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						() => getData(),
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						() => getData(),
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						() => getData(),
						{ signal },
					);
				}
			},
		});
	}
}
