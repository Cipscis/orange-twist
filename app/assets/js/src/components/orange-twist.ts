import { getAllDayNotes } from '../registers/dayNotesRegister.js';

export class OrangeTwist extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const dayListHeading = document.createElement('h2');
		dayListHeading.textContent = 'Days';
		root.append(dayListHeading);

		const dayNotes = getAllDayNotes();
		if (dayNotes.length > 0) {
			const daysList = document.createElement('ul');
			root.append(daysList);

			for (const [day, note] of dayNotes) {
				const itemEl = document.createElement('li');
				daysList.append(itemEl);

				const dayEl = document.createElement('div');
				itemEl.append(dayEl);

				const dayHeading = document.createElement('h3');
				dayHeading.textContent = day;
				itemEl.append(dayHeading);

				const dayNoteEl = document.createElement('p');
				dayNoteEl.textContent = note;
				itemEl.append(note);
			}
		}
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist', OrangeTwist);

export {};
