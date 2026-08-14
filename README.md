# inline-json-for-html

[![CI](https://github.com/edilec/inline-json-for-html/actions/workflows/ci.yml/badge.svg)](https://github.com/edilec/inline-json-for-html/actions/workflows/ci.yml)

A small, dependency-free Node.js utility for serializing JSON for an HTML
`<script type="application/json">` element.

HTML treats the contents of a script element as raw text. A JSON string that
contains `</script>` can therefore close the element before an application has
a chance to call `JSON.parse`. This package preserves the JSON value while
escaping the characters that are significant in that parsing context.

## Install

```sh
npm install github:edilec/inline-json-for-html#v0.1.0
```

Node.js 22 or newer is supported.

## Serialize JSON

```js
import { serializeInlineJson } from 'inline-json-for-html'

const value = {
  message: '</script><script>alert("not executed")</script>',
}

const serialized = serializeInlineJson(value)
const html = `<script type="application/json" id="page-data">${serialized}</script>`
```

The serialized text remains valid JSON:

```js
const valueAgain = JSON.parse(serialized)
```

`serializeInlineJson` accepts a native `JSON.stringify` replacer and a numeric
spacing option from 0 through 10:

```js
serializeInlineJson(value, {
  replacer: ['message'],
  space: 2,
})
```

## What it escapes

The serializer uses JSON Unicode escapes for `<`, `>`, `&`, U+2028, and U+2029.
`JSON.parse` reconstructs the original values.

## Boundaries

- This package is for JSON placed as the text content of an HTML script
  element. It is not a general-purpose HTML sanitizer.
- It returns JSON text only. Your application remains responsible for creating
  the surrounding script element and safely handling its attributes.
- It does not make a string safe for an event handler, URL, style declaration,
  JavaScript source expression, or arbitrary HTML attribute.
- Native `JSON.stringify` behavior still applies. Cyclic values and `BigInt`
  values throw, unsupported object properties are omitted, and getters,
  `toJSON`, and replacer callbacks execute normally.
- A top-level value that `JSON.stringify` cannot represent throws instead of
  returning an ambiguous result.
- Parse the embedded value with `JSON.parse`; do not execute it as JavaScript.

## Development

```sh
npm test
npm pack --dry-run
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contribution workflow and
[SECURITY.md](./SECURITY.md) for private vulnerability reporting.

## License

[MIT](./LICENSE) © 2026 Edilec Private Limited
