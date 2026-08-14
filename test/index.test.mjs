import assert from 'node:assert/strict'
import test from 'node:test'

import { serializeInlineJson } from '../index.mjs'

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

test('escapes dangerous characters in keys, values, and mixed-case terminators', () => {
  const value = {
    '</ScRiPt><img src=x onerror=alert(1)>': '<!-- <SCRIPT> </script > &',
  }
  const serialized = serializeInlineJson(value)

  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u)
  assert.deepEqual(JSON.parse(serialized), value)
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

test('escapes values produced by replacer functions and toJSON methods', () => {
  const value = {
    replacement: 'initial',
    nested: {
      toJSON() {
        return '</script from toJSON>'
      },
    },
  }
  const serialized = serializeInlineJson(value, {
    replacer(key, entry) {
      return key === 'replacement' ? '<from replacer & value>' : entry
    },
  })

  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u)
  assert.deepEqual(JSON.parse(serialized), {
    replacement: '<from replacer & value>',
    nested: '</script from toJSON>',
  })
})

test('retains native handling for dates, non-finite numbers, emoji, and lone surrogates', () => {
  const value = {
    date: new Date('2026-08-14T00:00:00.000Z'),
    nan: Number.NaN,
    positiveInfinity: Number.POSITIVE_INFINITY,
    negativeInfinity: Number.NEGATIVE_INFINITY,
    emoji: '🛠️',
    loneSurrogate: '\ud800',
  }
  const serialized = serializeInlineJson(value, { space: 10 })

  assert.deepEqual(JSON.parse(serialized), JSON.parse(JSON.stringify(value)))
})

test('rejects invalid options and spacing that could produce invalid JSON', () => {
  assert.throws(() => serializeInlineJson({}, null), /Options must be an object/)
  assert.throws(() => serializeInlineJson({}, []), /Options must be an object/)
  assert.throws(() => serializeInlineJson({}, { space: '  ' }), /integer from 0 through 10/)
  assert.throws(() => serializeInlineJson({}, { space: -1 }), /integer from 0 through 10/)
  assert.throws(() => serializeInlineJson({}, { space: 11 }), /integer from 0 through 10/)
  assert.throws(() => serializeInlineJson({}, { space: 1.5 }), /integer from 0 through 10/)
})

test('rejects an unsupported top-level value', () => {
  assert.throws(() => serializeInlineJson(undefined), /top-level value/)
  assert.throws(() => serializeInlineJson(Symbol('value')), /top-level value/)
  assert.throws(() => serializeInlineJson(() => {}), /top-level value/)
})

test('retains native JSON.stringify failures for BigInt and cyclic data', () => {
  assert.throws(() => serializeInlineJson(1n), TypeError)

  const cyclic = {}
  cyclic.self = cyclic
  assert.throws(() => serializeInlineJson(cyclic), TypeError)
})
