# Render asynchronous data

## Status

Decided (2026-09-27)

## Context

During the 2026 backend rewrite, UI components have been refactored to directly read from and write to an asynchronous data source (currently IndexedDB) instead of the previous approach of interacting synchronously with an in-memory cache.

Rendering UI associated with an asynchronous data retrieval process requires additional handling of loading and error states, and comes with challenges in areas such as layout shift and testability.

At the time of this decision, Orange Twist's UI is rendered using Preact.

## Decision

- Asynchronous data should be represented by an `AsyncDataState` (or a modified form such as `SettableAsyncDataState`) retrieved via the `useAsyncData` hook.
- Preact components driven by asynchronous data should be split into three parts:
  - `ComponentName` constructs and maintains a live `AsyncDataState`. This component is the main one used within other UI
  - `ComponentNameLoader` receives an `AsyncDataState` and renders an appropriate loading, error, or success state. This component is only used by `ComponentName` or within testing code.
  - `ComponentNameSync` receives data directly, and renders synchronously. This code is predominantly just used within `ComponentNameLoader`, but may also be used in other UI if the required information has already been retrieved

## Consequences

Splitting components into these three layers makes it easier to write the bottom level component that only cares about the success state. It also makes layout testing easier as a statically constructed `AsyncDataState` can be provided to the `ComponentNameLoader` layer.
