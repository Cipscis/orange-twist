type Truthy<T> = T extends false | 0 | '' | null | undefined | 0n
	? never
	: T;

interface Array<T> {
	filter(
		predicate: BooleanConstructor,
		thisArg?: unknown
	): Truthy<T>[];
}

interface ReadonlyArray<T> {
	filter(
		predicate: BooleanConstructor,
		thisArg?: unknown
	): readonly Truthy<T>[];
}
