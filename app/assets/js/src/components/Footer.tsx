import { h, type JSX } from 'preact';

/**
 * Renders static footer content.
 */
export function Footer(): JSX.Element {
	return <footer class="orange-twist__footer content">
		<div class="orange-twist__footer-row">
			<span class="orange-twist__footer-version">by Brooke Hart</span>
			<span class="orange-twist__footer-version">version <a href="https://github.com/Cipscis/orange-twist/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">{__VERSION__}</a></span>
		</div>
		<div class="orange-twist__footer-row">
			<a href="/help/">
				<span aria-hidden>📖</span> How do I use this?
			</a>
			<a href="https://github.com/Cipscis/orange-twist/" target="_blank" rel="noreferrer">
				<span aria-hidden>🧑‍💻</span> See the code
			</a>
			<a href="https://github.com/Cipscis/orange-twist/issues/new?labels=bug&template=bug-report.md" target="_blank" rel="noreferrer">
				<span aria-hidden>🐛</span> Report a bug
			</a>
			<a href="https://github.com/Cipscis/orange-twist/issues/new?labels=enhancement&template=feature-request.md" target="_blank" rel="noreferrer">
				<span aria-hidden>✨</span> Request a feature
			</a>
		</div>
	</footer>;
}
