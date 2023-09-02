# Commands

## Adding a command

Adding a new command requires a few different pieces of code.

### Definition

First, the new command must be defined. This is done by adding to the `CommandsList` interface found in [`CommandsList.ts`](./types/CommandsList.ts).

A declaration can be "re-opened" for [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) in TypeScript by using `declare module`, like this:

```typescript
declare module 'path/to/CommandsList.ts' {
	interface CommandsList {
		'my-new-command': [myCommandArg: number];
	}
}
```

Commands are defined in terms of what arguments their listeners should be able to take. However, command listeners must also be able to work without any arguments at all.

### Registration

After being defined, a command must be registered with the commands register. This is done by calling `registerCommand`.

Registering a command will make it appear in the command palette, and allows `fireCommand` to be called on that command to execute all listeners bound to that command.

### Binding listeners

In order for a command to actually do anything, listeners will need to be bound to it to define its behaviour. This can be done using the `addCommandListener` function, and listeners can similarly be removed via the `removeCommandListener` function.

When working within a Preact component, the `useCommand` hook can be used to bind a listener more easily.

## Arguments

Commands must have arguments specified, but if it accepts no arguments then an empty tuple type `[]` should be used.

Commands' listeners must always be able to work if passed no arguments, as arguments cannot be passed via the command palette. However, when a command is executed via `fireCommand`, arguments can be passed at that point.
