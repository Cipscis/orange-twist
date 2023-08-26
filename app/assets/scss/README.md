# SCSS Structure

The SCSS in this project is split into a few different layers:

## Scaffolding

All "scaffolding" SCSS files should emit no CSS at all. This is where mixins, functions, and shared variables can be defined.

## Base

Split into the `reset` and `theme` CSS layers, this section defines base styling such as reset styles and setting up colours and fonts, but it doesn't contain any component-specific styles.

## Main

The remaining SCSS doesn't use a CSS layer, and sets out the styles for specific components.
