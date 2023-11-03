import type { EnumTypeOf } from './EnumTypeOf';

/**
 * Names of CSS animations defined using `@keyframes` in `_animations.scss`.
 */
export const CSSKeyframes = {
	SPIN_CW: 'spinCW',

	APPEAR_UP: 'appearUp',
	DISAPPEAR_UP: 'disappearUp',

	APPEAR_SCREEN: 'appearScreen',
	DISAPPEAR_SCREEN: 'disappearScreen',
} as const;
export type CSSKeyframes = EnumTypeOf<typeof CSSKeyframes>;
