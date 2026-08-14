import assert from 'node:assert/strict'
import test from 'node:test'

import { createInlineJsonScript, serializeInlineJson } from '../index.mjs'

test('round-trips ordinary nested JSON values', () => {
  const value = {
    name: 'Edilec',
    active: true,
    count: 3,
    nested: { values: [null, 'software', 'AI'] },
  }

  const serialized = serializeInlineJson(value)

  assert.deepEqual(JSON.parse(serialized), value)
})

test('neutralizes a raw script-closing sequence while preserving its value', () => {
  const value = {
    text: '</script><script>alert("not executed")</script>',
  }

  const serialized = serializeInlineJson(value)

  assert.equal(serialized.includes('</script'), false)
  assert.equal(serialized.includes('<script'), false)
  assert.deepEqual(JSON.parse(serialized), value)
})

test('escapes HTML-significant characters and JavaScript line separators', () => {
  const value = '<>&\u2028\u2029'
  const serialized = serializeInlineJson(value)

  assert.equal(serialized, '"\\u003C\\u003E\\u0026\\u2028\\u2029"')
  assert.equal(JSON.parse(serialized), value)
})

test('supports native replacer and spacing options without mutating input', () => {
  const value = { keep: '<value>', omit: 'private' }
  const snapshot = structuredClone(value)
  const serialized = serializeInlineJson(value, {
    replacer: ['keep'],
    space: 2,
  })

  assert.equal(serialized, '{\n  "keep": "\\u003Cvalue\\u003E"\n}')
  assert.deepEqual(value, snapshot)
})

test('creates an application/json script and encodes its id attribute', () => {
  const html = createInlineJsonScript(
    { text: '</script>' },
    { id: 'page-data" onload="alert(1)' },
  )

  assert.equal(
    html,
    '<script type="application/json" id="page-data&quot; onload=&quot;alert(1)">{"text":"\\u003C/script\\u003E"}</script>',
  )
  assert.equal(html.includes(' onload="'), false)
})

test('omits the id attribute when it is not provided', () => {
  assert.equal(
    createInlineJsonScript({ ready: true }),
    '<script type="application/json">{"ready":true}</script>',
  )
})

test('rejects invalid options and invalid script ids', () => {
  assert.throws(() => serializeInlineJson({}, null), /Options must be an object/)
  assert.throws(() => serializeInlineJson({}, []), /Options must be an object/)
  assert.throws(() => createInlineJsonScript({}, { id: '' }), /non-empty string/)
  assert.throws(() => createInlineJsonScript({}, { id: 42 }), /non-empty string/)
})

test('rejects an unsupported top-level value', () => {
  assert.throws(() => serializeInlineJson(undefined), /top-level value/)
  assert.throws(() => serializeInlineJson(Symbol('value')), /top-level value/)
})

test('retains native JSON.stringify failures for BigInt and cyclic data', () => {
  assert.throws(() => serializeInlineJson(1n), TypeError)

  const cyclic = {}
  cyclic.self = cyclic
  assert.throws(() => serializeInlineJson(cyclic), TypeError)
})
