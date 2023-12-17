import { createContext } from 'preact';

export type OrangeTwistContext = {
	isLoading: boolean;
};

export const OrangeTwistContext = createContext<OrangeTwistContext>({
	isLoading: true,
});
