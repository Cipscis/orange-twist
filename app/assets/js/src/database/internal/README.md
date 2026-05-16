## Database internal functions

The functions in this folder exist to allow multiple requests to be combined on a single database transaction. They all follow the same pattern of taking in an `IDBTransaction` with set permissions (e.g. writing a day requires write access to the day object store) and returning a `Promise` that resolves when all `IDBRequest`s constructed within the object have completed.

Because of the requirement to construct an `IDBTransaction` with appropriate permissions in order to use these functions, they are intended only for internal use within database code.