import assert from 'node:assert/strict'
import test from 'node:test'

import { serializeInlineJson } from '../index.mjs'

/**
 * Minimal raw-text extractor used as a local parser fixture.
 *
 * A script element's content is raw text: it ends at the first `</script`
 * followed by whitespace, `/` or `>`, case-insensitively. That rule is the
 * whole reason this package escapes `<`, so the fixture implements exactly it
 * rather than depending on a full HTML parser. It is a test fixture, not a
 * general-purpose HTML parser.
 */
function readScriptData(html, id) {
  const opening = new RegExp(`<script\\b[^>]*\\bid="${id}"[^>]*>`, 'i').exec(html)
  assert.ok(opening, `no script element with id "${id}"`)

  const body = html.slice(opening.index + opening[0].length)
  const end = /<\/script[\s/>]/i.exec(body)
  assert.ok(end, 'script element was never closed')

  return { data: body.slice(0, end.index), remainder: body.slice(end.index) }
}

function renderPage(value, options) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>t</title></head>
  <body>
    <script type="application/json" id="page-data">${serializeInlineJson(value, options)}</script>
    <p id="after">after</p>
  </body>
</html>`
}

test('round-trips nested Unicode data through an HTML parse', () => {
  const value = {
    title: 'Edilec — outils',
    emoji: '🛠️',
    scripts: ['日本語', 'Ελληνικά', 'العربية', 'עברית'],
    nested: { deep: { combining: 'é', astral: '𝔘𝔫𝔦' } },
    separators: 'one\u2028two\u2029three',
  }

  const { data } = readScriptData(renderPage(value, { space: 2 }), 'page-data')

  assert.deepEqual(JSON.parse(data), value)
})

test('a hostile payload cannot terminate its containing script element', () => {
  const value = {
    a: '</script><script>globalThis.OWNED = true</script>',
    b: '</SCRIPT >',
    c: '</script/',
    d: '<!--</script>-->',
    '</script>': 'in a key too',
  }

  const html = renderPage(value)
  const { data, remainder } = readScriptData(html, 'page-data')

  // The element ends exactly once, at the real closing tag we emitted.
  assert.ok(remainder.startsWith('</script>'))
  assert.equal(html.match(/<\/script[\s/>]/gi).length, 1)

  // And the payload survives intact.
  assert.deepEqual(JSON.parse(data), value)
})

test('the document structure after the script element is unaffected', () => {
  const { remainder } = readScriptData(
    renderPage({ escape: '</script><p id="after">injected</p>' }),
    'page-data',
  )

  assert.equal(remainder.match(/id="after"/g).length, 1)
})
