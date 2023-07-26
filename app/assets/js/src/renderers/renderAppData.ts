import { AppData } from '../types/AppData.js';
import { renderDay } from './renderDay.js';
import { renderTask } from './renderTask.js';

export function renderAppData(appData: AppData): string {
	return `
<div>
	<h2>Days</h2>
	<ul class="day-list">
		${appData.days.map(renderDay).join('')}
	</ul>

	<h2>Unfinished tasks</h2>
	<ul class="task-list">
		${appData.unfinished.map(renderTask).join('')}
	</ul>
</div>`;
}
