import { dayRegister } from '../registers/dayRegister.js';

import './orange-twist-day.js';

class OrangeTwistDayList extends HTMLUListElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const days = Array.from(dayRegister.keys());

		for (const day of days) {
			const item = document.createElement('li');

			const dayEl  = document.createElement('orange-twist-day');
			dayEl.setAttribute('day', day);
			item.append(dayEl);

			root.append(item);
		}
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist-day-list', OrangeTwistDayList, { extends: 'ul' });

export {};
