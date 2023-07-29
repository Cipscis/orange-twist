import { h, render } from 'preact';
import htm from 'htm';

import { OrangeTwist } from './components/OrangeTwist.js';
import { setDayData } from './registers/days/index.js';

const html = htm.bind(h);

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}
setDayData('2023-07-29', {
	note: 'Test note',
});
render(html`<${OrangeTwist} />`, main);
setDayData('2023-07-27', {
	note: 'Test note on the 27th\nAnother paragraph',
	sections: [
		{
			name: 'Tasks',
		},
	],
});

// window.setTimeout(() => {
// 	setDayData('2023-07-24', {
// 		note: 'Earlier date',
// 		sections: [
// 			{
// 				name: 'Section',
// 			},
// 		],
// 	});
// }, 1000);
