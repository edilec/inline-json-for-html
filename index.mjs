const JSON_ESCAPES = Object.freeze({
  '<': '\\u003C',
  '>': '\\u003E',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
})

function assertOptions(options) {
  if (options === undefined) return {}

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object when provided.')
  }

  return options
}

function assertSpace(space) {
  if (
    space !== undefined &&
    (!Number.isInteger(space) || space < 0 || space > 10)
  ) {
    throw new TypeError('Space must be an integer from 0 through 10 when provided.')
  }
}

/**
 * Serialize a value as JSON that can be placed in the raw-text content of an
 * HTML script element.
 *
 * @param {unknown} value
 * @param {{ replacer?: ((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[], space?: number }} [options]
 * @returns {string}
 */
export function serializeInlineJson(value, options) {
  const { replacer, space } = assertOptions(options)
  assertSpace(space)
  const serialized = JSON.stringify(value, replacer, space)

  if (serialized === undefined) {
    throw new TypeError('The top-level value cannot be represented as JSON.')
  }

  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => JSON_ESCAPES[character])
}
