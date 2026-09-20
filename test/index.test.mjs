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

test('rejects BigInt and cyclic data with TypeError', () => {
  assert.throws(() => serializeInlineJson(1n), TypeError)

  const cyclic = {}
  cyclic.self = cyclic
  assert.throws(() => serializeInlineJson(cyclic), TypeError)
})

test('serialization failures do not echo cyclic property names in either mode', () => {
  const canary = 'SYNTHETIC_SECRET_CANARY'
  const hidden = String.fromCodePoint(0x202e)
  const cyclic = {}
  cyclic[`token=${canary}${hidden}`] = cyclic

  for (const options of [undefined, { onUnsupported: 'throw' }]) {
    assert.throws(() => serializeInlineJson(cyclic, options), (error) => {
      assert.ok(error instanceof TypeError)
      assert.ok(error.message.length > 0)
      assert.equal(String(error.stack).includes(canary), false)
      assert.equal(String(error.stack).includes(hidden), false)
      return true
    })
  }
})

test('getter and replacer exceptions do not echo their private messages', () => {
  const canary = 'SYNTHETIC_SECRET_CANARY'
  const withGetter = { get value() { throw new Error(canary) } }
  const throwingReplacer = () => { throw new Error(canary) }

  for (const attempt of [
    () => serializeInlineJson(withGetter),
    () => serializeInlineJson(withGetter, { onUnsupported: 'throw' }),
    () => serializeInlineJson({ value: 1 }, { replacer: throwingReplacer }),
    () => serializeInlineJson({ value: 1 }, { replacer: throwingReplacer, onUnsupported: 'throw' }),
    () => serializeInlineJson({ value: 1 }, { replacer: () => { throw null }, onUnsupported: 'throw' }),
  ]) {
    assert.throws(attempt, (error) => {
      assert.ok(error instanceof TypeError)
      assert.ok(error.message.length > 0)
      assert.equal(String(error.stack).includes(canary), false)
      return true
    })
  }
})

test('a callback cannot forge or reuse a prior strict error to expose private text', () => {
  let prior
  assert.throws(() => serializeInlineJson({ missing: undefined }, { onUnsupported: 'throw' }), (error) => {
    prior = error
    return true
  })
  const canary = 'SYNTHETIC_SECRET_CANARY'
  const fabricated = new prior.constructor(canary)
  prior.message = canary

  for (const thrown of [fabricated, prior]) {
    for (const options of [
      { replacer: () => { throw thrown } },
      { replacer: () => { throw thrown }, onUnsupported: 'throw' },
    ]) {
      assert.throws(() => serializeInlineJson({ value: 1 }, options), (error) => {
        assert.ok(error instanceof TypeError)
        assert.ok(error.message.length > 0)
        assert.equal(String(error.stack).includes(canary), false)
        return true
      })
    }
  }
})
