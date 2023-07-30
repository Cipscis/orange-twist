import { h, render } from 'preact';
import htm from 'htm';

import { OrangeTwist } from './components/OrangeTwist.js';

const html = htm.bind(h);

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(html`<${OrangeTwist} />`, main);
