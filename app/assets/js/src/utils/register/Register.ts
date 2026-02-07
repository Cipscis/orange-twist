// Type-only import to expose symbol to JSDoc
import type { useRegister } from './useRegister';

import { assertAllUnionMembersHandled } from '../assertAllUnionMembersHandled';

/**
 * A type with keys for each type of event that can be bound on a {@linkcode Register}, and
 * values for the event object passed to listeners for that type of event.
 */
interface RegisterEventMap<K, V> {
	// Technically 'set' only ever receives a tuple with one member,
	// but TypeScript seems to have trouble with that approach. I belive
	// it may be related to this issue:
	// https://github.com/microsoft/TypeScript/issues/51693
	'set':    { key: K; value: V; }[];
	'delete': { key: K; value: V; }[];
}

interface RegisterAddEventListenerOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal` object's
	 * `abort()` method is called. If not specified, no `AbortSignal` is associated with
	 * the listener.
	 */
	signal?: AbortSignal;
}

/**
 * A discriminated union of tuples used to allow narrowing of the `callback` argument based on
 * the `type` argument within event binding functions.
 */
type RegisterEventBindingArguments<K, V> = {
	[T in keyof RegisterEventMap<K, V>]: [
		type: T,
		callback: (event: RegisterEventMap<K, V>[T]) => void,
		options?: RegisterAddEventListenerOptions
	];
}[keyof RegisterEventMap<K, V>];

/**
 * Event listener types for a `Register`.
 *
 * @example
 * ```typescript
 * declare const register: Register<K, V>;
 *
 * const setListener: RegisterEventListener<K, V>["set"] = (changes) => {
 *     // do something
 * };
 * register.addEventListener('set', setListener);
 *
 * const deleteListener: RegisterEventListener<K, V>["delete"] = (changes) => {
 *     // do something
 * };
 * register.addEventListener('delete', setListener);
 *
 * // This listener can be used on both set and delete events
 * const setOrDeleteListener: RegisterEventListener<K, V>["set" | "delete"] = (changes) => {
 *     // do something
 * };
 * register.addEventListener('set', setListener);
 * register.addEventListener('delete', setListener);
 * ```
 */
export type RegisterEventListener<K, V> = {
	[T in keyof RegisterEventMap<K, V>]: Extract<RegisterEventBindingArguments<K, V>, { 0: T; }>[1];
};

/**
 * A `Map`-like object that can be used to store arbitrary data in a way that allows event-driven
 * responses to changes in that data.
 *
 * **Important**: Any objects stored as values within a `Register` should be treated as immutable.
 * Any mutations will not be recognised as changes, and will not fire the appropriate events.
 *
 * @example
 * ```typescript
 * const register = new Register<string, number>();
 * register.addEventListener('set', console.log);
 *
 * register.set('foo', 1);
 * // > { key: 'foo', value: 1 }
 * ```
 *
 * @see {@linkcode useRegister} for how to observe a `Register` within a Preact context.
 */
export class Register<K, V> {
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#map = new Map(iterable);

		this.#setListeners = new Set();
		this.#deleteListeners = new Set();
	}

	/**
	 * @internal
	 *
	 * The values stored within the Register.
	 */
	#map: Map<K, V>;

	/**
	 * @internal
	 *
	 * Event listeners for 'set' events.
	 */
	#setListeners: Set<Extract<RegisterEventBindingArguments<K, V>, { 0: 'set'; }>[1]>;

	/**
	 * @internal
	 *
	 * Event listeners for 'delete' events.
	 */
	#deleteListeners: Set<Extract<RegisterEventBindingArguments<K, V>, { 0: 'delete'; }>[1]>;

	/**
	 * Retrieve the value for a given key. If the key does not exist, returns `undefined`.
	 */
	get(key: K): V | undefined {
		return this.#map.get(key);
	}

	/**
	 * Sets the value for a given key. If the key already has a value, it will be overridden.
	 *
	 * If the value passed is the same as the existing value of the key, nothing will change.
	 */
	set(key: K, value: V): void;
	set(entries: readonly (readonly [key: K, value: V])[]): void;
	set(...args: [K, V] | [readonly (readonly [K, V])[]]): void {
		const entriesToSet: (readonly [K, V])[] = [];
		const setEntries: { key: K; value: V; }[] = [];

		if (args.length === 2) {
			entriesToSet.push(args);
		} else {
			entriesToSet.push(...args[0]);
		}

		for (const [key, value] of entriesToSet) {
			if (
				// We check `has` in case the value is `undefined`
				this.#map.has(key) &&
				this.#map.get(key) === value
			) {
				// Don't do anything.
				continue;
			}

			this.#map.set(key, value);
			setEntries.push({ key, value });
		}

		if (setEntries.length === 0) {
			return;
		}

		for (const listener of this.#setListeners.values()) {
			listener(setEntries);
		}
	}

	/**
	 * @returns boolean indicating whether an element with the specified key exists or not.
	 */
	has(key: K): boolean {
		return this.#map.has(key);
	}

	/**
	 * Deletes a key from the Register.
	 *
	 * @returns `true` if an element in the Register existed and has been removed, or `false`
	 * if the element does not exist.
	 */
	delete(key: K): boolean;
	/**
	 * Deletes multiple keys from the Register.
	 *
	 * @returns `true` if any elements were removed from the Register, or `false` otherwise.
	 */
	delete(...keys: K[]): boolean;
	delete(...keys: K[]): boolean {
		let deletedAnything = false;
		const deletions: { key: K; value: V; }[] = [];

		for (const key of keys) {
			if (this.#map.has(key)) {
				// This type assertion is safe because we've already checked `has`
				const value = this.#map.get(key) as V;
				const result = this.#map.delete(key);
				if (result) {
					deletedAnything = true;
				}

				deletions.push({ key, value });
			}
		}

		if (deletions.length > 0) {
			for (const listener of this.#deleteListeners.values()) {
				listener(deletions);
			}
		}

		return deletedAnything;
	}

	/**
	 * Removes all entries from the Register.
	 */
	clear(): void {
		const deletedEntries: {
			key: K;
			value: V;
		}[] = [];

		for (const [key, value] of this.#map.entries()) {
			deletedEntries.push({
				key,
				value,
			});
			this.#map.delete(key);
		}

		if (deletedEntries.length === 0) {
			return;
		}

		for (const listener of this.#deleteListeners.values()) {
			listener([...deletedEntries]);
		}
	}

	/**
	 * Returns an iterable of `[key, value]` pairs for every entry in the register.
	 */
	entries(): IterableIterator<[K, V]> {
		return this.#map.entries();
	}

	/**
	 * Returns an iterable of the Register's keys.
	 */
	keys(): IterableIterator<K> {
		return this.#map.keys();
	}

	/**
	 * Returns an iterable of the Register's values.
	 */
	values(): IterableIterator<V> {
		return this.#map.values();
	}

	/**
	 * Bind an event listener of the specified type.
	 *
	 * @see {@linkcode Register.removeEventListener} for
	 * removing bound event listeners.
	 */
	addEventListener(...[type, callback, options]: RegisterEventBindingArguments<K, V>): void {
		if (options?.signal?.aborted) {
			// Don't add the event listener if it has an already aborted signal
			return;
		}

		// Add the listener to the appropriate internal `Set`
		// We rely on the behaviour of `Set` to prevent the
		// same listener from being bound multiple times
		if (type === 'set') {
			this.#setListeners.add(callback);
		} else if (type === 'delete') {
			this.#deleteListeners.add(callback);
		} else {
			/* istanbul ignore next */
			assertAllUnionMembersHandled(
				type,
				(value) => `Unrecognised event type '${value}'`
			);
		}

		if (options?.signal) {
			options.signal.addEventListener(
				'abort',
				() => this.removeEventListener(
					// This type assertion is necessary because TypeScript loses
					// information about linked types of tuple type members
					// https://github.com/microsoft/TypeScript/issues/55344
					...[type, callback] as RegisterEventBindingArguments<K, V>
				)
			);
		}
	}

	/**
	 * Unbind an event listener bound with {@linkcode Register.addEventListener}.
	 */
	removeEventListener(...[type, callback]: RegisterEventBindingArguments<K, V>): void {
		// Remove the listener from the appropriate internal `Set`
		// We rely on the behaviour of `Set` to behave correctly
		// if attempting to remove an unbound listener
		if (type === 'set') {
			this.#setListeners.delete(callback);
		} else if (type === 'delete') {
			this.#deleteListeners.delete(callback);
		} else {
			/* istanbul ignore next */
			assertAllUnionMembersHandled(
				type,
				(value) => `Unrecognised event type '${value}'`
			);
		}
	}
}
