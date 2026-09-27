# Changelog

All notable changes to this project are documented in this file.

## Unreleased

- Replace native and callback serialization error messages with a value-free
  `TypeError` so a cyclic key or callback exception cannot copy private input
  into diagnostics. Strict unsupported-value errors retain positional detail.
- Reject unknown option names and report unsupported nested object properties
  by source position, including legal empty-name properties.
- Separate `undefined` from unsupported types when a top-level value cannot be
  represented as JSON, so the error names the category instead of using one
  shared message.
- Add the optional `onUnsupported` option. `'omit'` is the default and keeps
  existing successful-serialization behavior; `'throw'` reports an
  unrepresentable nested value and its source position rather than silently
  dropping it.
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
