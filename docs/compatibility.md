# Compatibility

## Runtime matrix

| Environment | Status | Evidence |
| --- | --- | --- |
| Node.js 22 | Supported | CI tests, coverage, and package validation |
| Node.js 24 | Supported | CI tests, coverage, and package validation |
| Node.js 26 | Supported | CI tests, coverage, and package validation |
| Older Node.js | Unsupported | Outside the declared engine range |
| Browser import | Not published | No browser bundle or browser export is shipped |
| Deno or Bun | Not claimed | No maintained CI evidence |

The generated JSON text uses standard JSON Unicode escapes and can be consumed
by standards-conforming `JSON.parse` implementations.

## Module formats

The package is ESM-only and exposes bundled TypeScript declarations.

```js
import { serializeInlineJson } from 'inline-json-for-html'
```

CommonJS applications can use dynamic import:

```js
const { serializeInlineJson } = await import('inline-json-for-html')
```

A synchronous `require()` export is not provided. Adding one would create a
second build and release artefact that must be tested and maintained; there is
not currently enough evidence that this complexity is warranted.

## Frameworks and bundlers

No framework-specific adapter is required for the supported operation. A
framework or bundler is supported only to the extent that it preserves the
documented ESM import and the output is placed in script-element text. Open an
issue with a minimal reproduction before adding a compatibility claim.
