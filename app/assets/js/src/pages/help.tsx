import { h, render } from 'preact';

import { OrangeTwist } from 'components/OrangeTwist';
import { Help } from 'components/Help';

const main = document.getElementById('main');
if (main === null) {
	throw new Error('Missing main element');
}

render(<OrangeTwist backButton>
	<Help />
</OrangeTwist>, main);
