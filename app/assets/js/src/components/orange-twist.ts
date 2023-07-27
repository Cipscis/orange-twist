import './orange-twist-day-list.js';

export class OrangeTwist extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const root = this;

		const dayListHeader = Object.assign(
			document.createElement('h2'),
			{
				textContent: 'Days',
			} satisfies Partial<HTMLHeadingElement>
		);
		root.append(dayListHeader);

		const dayList = Object.assign(
			document.createElement('ul', { is: 'orange-twist-day-list' }),
			{
				className: 'day-list',
			} satisfies Partial<HTMLUListElement>
		);
		dayList.setAttribute('test', 'string');
		root.append(dayList);

		const taskListHeader = Object.assign(
			document.createElement('h2'),
			{
				textContent: 'Unfinished tasks',
			} satisfies Partial<HTMLHeadingElement>
		);
		root.append(taskListHeader);

		const taskList = Object.assign(
			document.createElement('ul'),
			{
				className: 'task-list',
			} satisfies Partial<HTMLUListElement>
		);
		root.append(taskList);
	}

	disconnectedCallback() {
		// Remove all children
		this.replaceChildren();
	}
}

customElements.define('orange-twist', OrangeTwist);

export {};
