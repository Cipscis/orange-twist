import { AsyncDataStateType, LiveData } from 'utils/asyncData';

import type { Template } from '../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';

import { loadTemplate } from './loadTemplate';

/**
 * Provides live access to a task and its status, derived from its canonical day task.
 */
export class LiveTemplate extends LiveData<Template> {
	constructor(templateId: number) {
		super({
			async getData(_options) {
				const template = await loadTemplate(templateId);

				if (template === null) {
					throw new Error(`Could not find template with ID ${templateId}`);
				}

				return template;
			},
			observeState(getDataArg, state, signal) {
				// Task listeners
				const changeEntity = {
					type: ChangeEntityType.TEMPLATE,
					id: templateId,
				};

				const getData = () => getDataArg();

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						changeEntity,
						getData,
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						getData,
						{ signal },
					);
				}
			},
		});
	}
}
