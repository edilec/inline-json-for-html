import assert from 'node:assert/strict'
import test from 'node:test'

import { serializeInlineJson } from '../index.mjs'

test('distinguishes an undefined top-level value from an unsupported type', () => {
  assert.throws(
    () => serializeInlineJson(undefined),
    /top-level value is undefined/,
  )
  assert.throws(
    () => serializeInlineJson(Symbol('value')),
    /top-level value is an unsupported symbol/,
  )
  assert.throws(
    () => serializeInlineJson(() => {}),
    /top-level value is an unsupported function/,
  )
})

test('keeps the generic top-level message when a function replacer produced the gap', () => {
  assert.throws(
    () => serializeInlineJson({ a: 1 }, { replacer: () => undefined }),
    /^TypeError: The top-level value cannot be represented as JSON\.$/,
  )
})

test('omits unrepresentable values by default, preserving native behaviour', () => {
  const serialized = serializeInlineJson({
    kept: 1,
    dropped: undefined,
    fn() {},
    sym: Symbol('s'),
    list: [1, undefined, 3],
  })

  assert.deepEqual(JSON.parse(serialized), { kept: 1, list: [1, null, 3] })
})

test('omit is accepted explicitly and behaves like the default', () => {
  const value = { kept: 1, dropped: undefined }

  assert.equal(
    serializeInlineJson(value, { onUnsupported: 'omit' }),
    serializeInlineJson(value),
  )
})

test('strict mode reports a dropped object property with its path', () => {
  assert.throws(
    () => serializeInlineJson({ a: { b: undefined } }, { onUnsupported: 'throw' }),
    /Cannot represent the undefined value at a\.b as JSON/,
  )
})

test('strict mode reports an unsupported array element with its index', () => {
  assert.throws(
    () => serializeInlineJson({ list: [1, Symbol('s')] }, { onUnsupported: 'throw' }),
    /Cannot represent the symbol value at list\[1\] as JSON/,
  )
  assert.throws(
    () => serializeInlineJson([() => {}], { onUnsupported: 'throw' }),
    /Cannot represent the function value at \[0\] as JSON/,
  )
})

test('strict mode reports a top-level property without a leading separator', () => {
  assert.throws(
    () => serializeInlineJson({ missing: undefined }, { onUnsupported: 'throw' }),
    /value at missing as JSON/,
  )
})

test('strict mode inspects legal empty-name properties at root and nested levels', () => {
  assert.equal(serializeInlineJson({ '': 1 }, { onUnsupported: 'throw' }), '{"":1}')
  assert.throws(
    () => serializeInlineJson({ '': undefined }, { onUnsupported: 'throw' }),
    /Cannot represent the undefined value/,
  )
  assert.throws(
    () => serializeInlineJson({ outer: { '': undefined } }, { onUnsupported: 'throw' }),
    /Cannot represent the undefined value/,
  )
})

test('strict mode inspects values after toJSON and after a function replacer', () => {
  assert.throws(
    () =>
      serializeInlineJson(
        { wrapped: { toJSON: () => undefined } },
        { onUnsupported: 'throw' },
      ),
    /undefined value at wrapped as JSON/,
  )

  assert.throws(
    () =>
      serializeInlineJson(
        { a: 1 },
        {
          onUnsupported: 'throw',
          replacer(key, entry) {
            return key === 'a' ? undefined : entry
          },
        },
      ),
    /undefined value at a as JSON/,
  )
})

test('strict mode passes representable data through unchanged and still escapes', () => {
  const value = { nested: { list: [1, '</script>'], ok: null } }
  const strict = serializeInlineJson(value, { onUnsupported: 'throw' })

  assert.equal(strict, serializeInlineJson(value))
  assert.doesNotMatch(strict, /[<>&\u2028\u2029]/u)
  assert.deepEqual(JSON.parse(strict), value)
})

test('strict mode accepts a non-object top-level value', () => {
  assert.equal(serializeInlineJson('plain', { onUnsupported: 'throw' }), '"plain"')
  assert.equal(serializeInlineJson(7, { onUnsupported: 'throw' }), '7')
})

test('strict mode rejects an array replacer, which omits properties by design', () => {
  assert.throws(
    () => serializeInlineJson({ a: 1 }, { replacer: ['a'], onUnsupported: 'throw' }),
    /requires a function replacer or no replacer/,
  )
})

test('rejects an unknown onUnsupported value', () => {
  assert.throws(
    () => serializeInlineJson({}, { onUnsupported: 'ignore' }),
    /must be 'omit' or 'throw'/,
  )
  assert.throws(
    () => serializeInlineJson({}, { onUnsupported: null }),
    /must be 'omit' or 'throw'/,
  )
})
