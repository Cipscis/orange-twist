# TS Fix

Type declaration files in this folder amend TypeScript to either make it more type safe (e.g. preferring `unknown` to `any`), or to fix bugs (e.g. `Array.isArray` not correctly narrowing `readonly` arrays).

Inspired heavily by [Matt Pocock's `ts-reset` library](https://www.totaltypescript.com/ts-reset).
