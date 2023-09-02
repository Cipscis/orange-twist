# Keyboard Shortcuts

## Adding a keyboard shortcut

Adding a new keyboard shortcut requires a few different pieces of code.

### Registration

Before it can be used, a keyboard listener must be reigstered with the keyboard shortcuts register. This is done by calling `registerKeyboardShortcut`.

Registering a keyboard shortcut specifies what key combinations will be used to fire it. These keys can be changed by calling `registerKeyboardShortcut` again, with the same name.

### Binding listeners

In order for a keyboard shortcut to actually do anything, listeners will need to be bound to it to define its behaviour.

If a keyboard shortcut needs to be bound to a [Command](../commands//README.md), this should be done using `bindKeyboardShortcutToCommand`. A keyboard shortcut can be unbound from a command using `unbindKeyboardShortcutFromCommand`.

For other functionality, listeners should be bound using the `addKeyboardShortcutListener` function, and listeners can similarly be removed via the `removeKeyboardShortcutListener` function.

When working within a Preact component, the `useKeyboardShortcut` hook can be used to bind a listener more easily, whether working with a command or bare functions.
