import { EnumTypeOf } from '@cipscis/ts-toolbox';

/**
 * Names of CSS animations defined using `@keyframes` in `_animations.scss`.
 */
export const CSSKeyframes = {
	DISAPPEAR_UP: 'disappearUp',
} as const;
export type CSSKeyframes = EnumTypeOf<typeof CSSKeyframes>;
