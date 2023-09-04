import { h } from 'preact';

interface CommandPaletteItemNameProps {
	name: string;
	query: string;
	queryPattern: RegExp | null;
}

/**
 * Display the name of a command palette item, highlighting which parts
 * of it match a query pattern if one is specified.
 */
export function CommandPaletteItemName(props: CommandPaletteItemNameProps) {
	const {
		name,
		query,
		queryPattern,
	} = props;

	if (queryPattern === null) {
		return <>{name}</>;
	}

	const match = name.match(queryPattern);
	if (match === null) {
		return null;
	}

	// Convert match into matched and unmatched tokens
	const tokens: Array<{ string: string, match: boolean; }> = [];
	let queryIndex = 0;
	for (const token of match.slice(1)) {
		// Step through groups, keeping track of our position in the query
		const remainingQuery = query.substring(queryIndex).toLowerCase();
		if (remainingQuery.indexOf(token.toLowerCase()) === 0) {
			// If this group is next in the query, it's part of the match and we should advance our position in the query
			queryIndex += token.length;

			const lastToken = tokens.at(-1);
			if (lastToken?.match === true) {
				// The last part was a match too, so append it
				lastToken.string += token;
			} else {
				// Make a new matched token
				tokens.push({ string: token, match: true });
			}
		} else {
			// Otherwise, it's a non-match
			tokens.push({ string: token, match: false });
		}
	}

	return <span class="command-palette__option__name">
		{tokens.map((token) => {
			return token.match
				? <b>{token.string}</b>
				: token.string;
		})}
	</span>;
}
