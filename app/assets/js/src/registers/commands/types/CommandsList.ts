/**
 * This interface is used to allow the list of commands to be extended
 * through [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
 * to allow new commands to have type information associated with them
 * that carries through to the Commands API.
 *
 * The value of a command's entry in `CommandsList` must be a tuple type
 * that describes the arguments that may be passed to its listeners. If
 * a command takes no arguments, use the empty tuple type `[]`.
 *
 * Once a command has been defined, it can be registered with {@linkcode registerCommand}.
 *
 * @example
 * ```typescript
 * declare module './path/to/commandsRegister.js' {
 *     interface CommandsList {
 *         ['my-command-id']: [argName: string];
 *     }
 * }
 * ```
 */
export interface CommandsList {
	/** This command is only used in testing */
	__TEST_COMMAND_A__: [argA: string, argB: boolean];
	/** This command is only used in testing */
	__TEST_COMMAND_B__: [argA: number, argB: boolean];
	/** This command is only used in testing */
	__TEST_COMMAND_C__: [];
}
