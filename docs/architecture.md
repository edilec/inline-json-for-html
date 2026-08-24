# Architecture

## Design

`serializeInlineJson` deliberately has two stages:

1. Native `JSON.stringify` defines JSON semantics, including replacers,
   `toJSON`, omitted values, dates, non-finite numbers, cycles, and `BigInt`.
2. A final pass replaces HTML-significant characters in the complete JSON text.

The final pass is important: values produced by getters, replacers, and
`toJSON` methods receive the same escaping as ordinary input values.

## Why the package is small

The package does not parse HTML, manipulate a DOM, own a template language, or
reimplement JSON. Those responsibilities would expand both the attack surface
and the compatibility contract without improving the supported use case.

## Error behavior

- Invalid options fail before serialization.
- Unsupported top-level values throw instead of returning `undefined`.
- Native failures for cycles and `BigInt` are preserved.
- Replacer, getter, or `toJSON` exceptions propagate unchanged.

## Release boundary

The distributable package contains the implementation, declarations, user and
security documentation, examples, licence, changelog, and maintainer/support
information. Tests, CI configuration, issue templates, and artwork are kept in
the repository rather than the npm tarball.
