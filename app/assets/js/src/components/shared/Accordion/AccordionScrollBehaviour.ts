import type { EnumTypeOf } from 'utils';
export const AccordionScrollBehaviour = {
	/** Allow the browser to automatically determine scroll behaviour. */
	AUTO: 'auto',
	/** When opening or closing the `Accordion`, keep its bottom edge fixed in place */
	ANCHOR_BOTTOM: 'anchor-bottom',
} as const;
export type AccordionScrollBehaviour = EnumTypeOf<typeof AccordionScrollBehaviour>;
