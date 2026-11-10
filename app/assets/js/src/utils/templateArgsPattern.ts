/**
 * Pattern used to find and manipulate arguments in template syntax, e.g. `{{{0|defaultValue}}}`.
 */export const templateArgsPattern = /{{{(\d+)(\|[^}]+)?}}}/g;
