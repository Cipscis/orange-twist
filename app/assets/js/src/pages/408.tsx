import { h, render } from 'preact';

import { OrangeTwist } from '../components/OrangeTwist';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist>
	<h1>Network error</h1>
</OrangeTwist>, main);
