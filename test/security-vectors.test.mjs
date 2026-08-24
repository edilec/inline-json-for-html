import assert from 'node:assert/strict'
import test from 'node:test'

import { serializeInlineJson } from '../index.mjs'

const vectors = [
  '</script>',
  '</SCRIPT>',
  '</ScRiPt><script>',
  '<!--</script>-->',
  '<script type="text/javascript">',
  '&lt;/script&gt;',
  '<img src=x onerror=alert(1)>',
  '\u2028line separator',
  '\u2029paragraph separator',
]

test('round-trips the maintained HTML-sensitive vector set', () => {
  for (const vector of vectors) {
    const serialized = serializeInlineJson({ [vector]: vector })

    assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u)
    assert.deepEqual(JSON.parse(serialized), { [vector]: vector })
  }
})

test('keeps pretty-printed nested values free of raw HTML-significant characters', () => {
  const value = {
    nested: [
      { text: '</script>' },
      { text: '<!-- comment -->' },
      { text: 'one\u2028two\u2029three & four' },
    ],
  }

  const serialized = serializeInlineJson(value, { space: 10 })

  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u)
  assert.deepEqual(JSON.parse(serialized), value)
})

test('applies the final escape pass to top-level primitive strings', () => {
  const serialized = serializeInlineJson('</script> & \u2028')

  assert.equal(serialized, '"\\u003C/script\\u003E \\u0026 \\u2028"')
  assert.equal(JSON.parse(serialized), '</script> & \u2028')
})
