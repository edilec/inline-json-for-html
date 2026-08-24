# inline-json-for-html

[![CI](https://github.com/edilec/inline-json-for-html/actions/workflows/ci.yml/badge.svg)](https://github.com/edilec/inline-json-for-html/actions/workflows/ci.yml)
[![CodeQL](https://github.com/edilec/inline-json-for-html/actions/workflows/codeql.yml/badge.svg)](https://github.com/edilec/inline-json-for-html/actions/workflows/codeql.yml)

Dependency-free JSON serialization for the raw-text content of an HTML
`<script type="application/json">` element.

HTML parses script-element contents as raw text. A JSON string containing
`</script>` can therefore close the element before an application calls
`JSON.parse`. This package preserves the JSON value while escaping five
characters through one documented serialization pass.

> **Security boundary:** this is not a general-purpose HTML sanitizer. It does
> not make data safe for attributes, event handlers, JavaScript source, CSS,
> URLs, or arbitrary HTML.

## Status

| Item | Current support |
| --- | --- |
| Release | [`v0.1.1`](https://github.com/edilec/inline-json-for-html/releases/tag/v0.1.1) |
| Runtime | Node.js 22 or newer |
| Module format | ESM; CommonJS can use dynamic `import()` |
| Types | Bundled TypeScript declarations |
| Runtime dependencies | None |
| Licence | [MIT](./LICENSE) |

## Install

The package is currently distributed from its versioned GitHub release tag:

```sh
npm install github:edilec/inline-json-for-html#v0.1.1
```

Registry publication is intentionally not claimed until an npm release process
and package ownership have been verified.

## Quick start

```js
import { serializeInlineJson } from 'inline-json-for-html'

const value = {
  message: '</script><script>alert("not executed")</script>',
}

const serialized = serializeInlineJson(value)
const html = `<script type="application/json" id="page-data">${serialized}</script>`
```

Read the value as data, not executable JavaScript:

```js
const element = document.querySelector('#page-data')
const valueAgain = JSON.parse(element.textContent)
```

For a CommonJS application, load the ESM package with dynamic import:

```js
async function render() {
  const { serializeInlineJson } = await import('inline-json-for-html')
  return serializeInlineJson({ status: 'ready' })
}
```

See [`examples/render-page.mjs`](./examples/render-page.mjs) for a complete,
locally runnable example.

## API

### `serializeInlineJson(value, options?)`

Returns JSON text suitable for the text content of an HTML script element.

```js
serializeInlineJson(value, {
  replacer: ['message'],
  space: 2,
})
```

Options follow native `JSON.stringify` behavior with one deliberate
restriction: `space` must be an integer from 0 through 10. A top-level value
that cannot be represented as JSON throws instead of returning `undefined`.

## What it escapes

| Character | Output | Reason |
| --- | --- | --- |
| `<` | `\u003C` | Prevents an HTML end-tag opener |
| `>` | `\u003E` | Keeps HTML-significant text escaped consistently |
| `&` | `\u0026` | Avoids HTML-significant ampersands in embedded data |
| U+2028 | `\u2028` | Produces stable escaped JSON across consumers |
| U+2029 | `\u2029` | Produces stable escaped JSON across consumers |

`JSON.parse` reconstructs the original values. Keys, values, replacer output,
and `toJSON` output pass through the same final escaping step.

## Context matrix

| Destination | Supported? | Required approach |
| --- | --- | --- |
| `<script type="application/json">` text | Yes | Serialize here; read with `textContent` and `JSON.parse` |
| JavaScript source expression | No | Use a JavaScript-aware serializer and CSP review |
| HTML attribute | No | Quote and encode for the exact attribute context |
| Event-handler attribute | No | Do not embed untrusted data there |
| HTML text or markup | No | Use text nodes or a reviewed HTML sanitizer |
| URL | No | Validate and encode for the URL component |
| CSS | No | Avoid embedding untrusted data; use a CSS-aware control |

The detailed security assumptions and abuse cases are in
[`docs/threat-model.md`](./docs/threat-model.md).

## Native JSON behavior retained

- Cyclic values and `BigInt` values throw.
- Unsupported object properties are omitted.
- Non-finite numbers become `null`.
- Getters, `toJSON`, and replacer callbacks execute normally.
- A replacer or `toJSON` implementation can have side effects; this package
  does not isolate user code.

## Architecture

```text
application value
      │
      ▼
JSON.stringify(value, replacer, space)
      │
      ▼
escape < > & U+2028 U+2029 in the serialized text
      │
      ▼
HTML script-element text ──textContent──▶ JSON.parse
```

The implementation deliberately has no DOM parser, HTML sanitizer, template
engine, or runtime dependency. See [`docs/architecture.md`](./docs/architecture.md).

## Compatibility

Node.js 22, 24, and 26 are tested in CI. Browser use concerns the generated
JSON text, not a browser runtime build of this package. Bundler, Deno, Bun, and
older-Node support are not currently claimed. See
[`docs/compatibility.md`](./docs/compatibility.md).

## Verification

```sh
npm run check
npm run example
```

`npm run check` verifies syntax, local documentation links, tests, 100% line,
branch and function coverage for the implementation, and the package allowlist.

## Security, support, and contributing

- Review the [threat model](./docs/threat-model.md) before using a new context.
- Report vulnerabilities through the private route in [SECURITY.md](./SECURITY.md).
- Read [SUPPORT.md](./SUPPORT.md) for usage questions and project scope.
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) before proposing a change.
- Maintainer responsibilities are recorded in [MAINTAINERS.md](./MAINTAINERS.md).
- The reviewed release procedure is documented in [docs/releasing.md](./docs/releasing.md).

## Licence

[MIT](./LICENSE) © 2026 Edilec Private Limited
