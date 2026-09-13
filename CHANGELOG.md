# Changelog

All notable changes to this project are documented in this file.

## Unreleased

- Separate `undefined` from unsupported types when a top-level value cannot be
  represented as JSON, so the error names the category instead of using one
  shared message.
- Add the optional `onUnsupported` option. `'omit'` is the default and keeps
  existing behavior exactly; `'throw'` reports an unrepresentable nested value
  and its path rather than silently dropping it.
- Document the supported-value contract in the README.
- Add an HTML raw-text parse fixture that extracts the embedded value back out
  of a rendered page, covering Unicode round-trips and confirming a hostile
  payload cannot terminate its containing script element.

## 0.1.1 - 2026-08-24

- Expand the threat model, compatibility guidance, context matrix, examples,
  security vectors, governance files, CI checks, and release validation.

## 0.1.0 - 2026-08-14

- Add JSON serialization for the raw-text content of HTML script elements.
- Add TypeScript declarations, tests, documentation, and CI.
