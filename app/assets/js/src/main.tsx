import { h, render } from 'preact';

import { OrangeTwist } from './components/OrangeTwist.js';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist />, main);
