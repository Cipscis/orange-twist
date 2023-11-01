import { assertAllUnionMembersHandled } from '../assertAllUnionMembersHandled.js';

/**
 * A type with keys for each type of event that can be bound on a {@linkcode Register}, and
 * values for the event object passed to listeners for that type of event.
 */
interface RegisterEventMap<K, V> {
	'set': { key: K; value: V; };
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

export class Register<K, V> {
	constructor(iterable?: Iterable<readonly [K, V]> | null) {
		this.#map = new Map(iterable);
		this.#setListeners = new Set();
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
	#setListeners: Set<Extract<RegisterEventBindingArguments<K, V>, { 0: 'set' }>[1]>;

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
	set(key: K, value: V): void {
		if (
			// We check `has` in case the value is `undefined`
			this.#map.has(key) &&
			this.#map.get(key) === value
		) {
			// Don't do anything.
			return;
		}

		this.#map.set(key, value);

		for (const listener of this.#setListeners.values()) {
			listener({ key, value });
		}
	}

	/**
	 * @returns boolean indicating whether an element with the specified key exists or not.
	 */
	has(key: K): boolean {
		return this.#map.has(key);
	}

	/**
	 * @returns `true` if an element in the Register existed and has been removed, or `false`
	 * if the element does not exist.
	 */
	delete(key: K): boolean {
		return this.#map.delete(key);
	}

	/**
	 * Returns an iterable of `[key, value]` pairs for every entry in the register.
	 */
	entries(): IterableIterator<[K, V]> {
		return this.#map.entries();
	}

	/**
	 * Bind an event listener of the specified type.
	 *
	 * @see {@linkcode Register.removeEventListener} for
	 * removing bound event listeners.
	 */
	addEventListener(...[type, callback, options]: RegisterEventBindingArguments<K, V>) {
		if (options?.signal?.aborted) {
			// Don't add the event listener if it has an already aborted signal
			return;
		}

		// Add the listener to the appropriate internal `Set`
		// We rely on the behaviour of `Set` to prevent the
		// same listener from being bound multiple times
		if (type === 'set') {
			this.#setListeners.add(callback);
		} else {
			assertAllUnionMembersHandled(
				type,
				(value) => `Unrecognised event type '${value}'`
			);
		}

		options?.signal?.addEventListener('abort', () => this.removeEventListener(type, callback));
	}

	/**
	 * Unbind an event listener bound with {@linkcode Register.addEventListener}.
	 */
	removeEventListener(...[type, callback]: RegisterEventBindingArguments<K, V>) {
		// Remove the listener from the appropriate internal `Set`
		// We rely on the behaviour of `Set` to behave correctly
		// if attempting to remove an unbound listener
		if (type === 'set') {
			this.#setListeners.delete(callback);
		} else {
			assertAllUnionMembersHandled(
				type,
				(value) => `Unrecognised event type '${value}'`
			);
		}
	}
}
