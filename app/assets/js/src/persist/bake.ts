import type { PersistApi, PersistOptions } from './PersistApi';

/**
 * Bake a set of {@linkcode PersistOptions} into a {@linkcode PersistApi},
 * so any time its methods are called the baked options are used as defaults.
 *
 * @param persist - The persistence adapter to bake options into.
 * @param bakedOptions - The options to base into the persistence adapter.
 */
export function bake(persist: PersistApi, bakedOptions: PersistOptions): PersistApi {
	return {
		get: (key, options) => persist.get(key, { ...bakedOptions, ...options }),
		set: (key, data, options) => persist.set(key, data, { ...bakedOptions, ...options }),
		delete: (key, options) => persist.delete(key, { ...bakedOptions, ...options }),
		bake: (options) => persist.bake({ ...bakedOptions, ...options }),
	};
}
