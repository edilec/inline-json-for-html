const JSON_ESCAPES = Object.freeze({
  '<': '\\u003C',
  '>': '\\u003E',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
})

const HTML_ATTRIBUTE_ESCAPES = Object.freeze({
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
})

function assertOptions(options) {
  if (options === undefined) return {}

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object when provided.')
  }

  return options
}

function escapeHtmlAttribute(value) {
  return value.replace(/[&"'<>]/g, (character) => HTML_ATTRIBUTE_ESCAPES[character])
}

/**
 * Serialize a value as JSON that can be placed in the raw-text content of an
 * HTML script element.
 *
 * @param {unknown} value
 * @param {{ replacer?: ((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[], space?: string | number }} [options]
 * @returns {string}
 */
export function serializeInlineJson(value, options) {
  const { replacer, space } = assertOptions(options)
  const serialized = JSON.stringify(value, replacer, space)

  if (serialized === undefined) {
    throw new TypeError('The top-level value cannot be represented as JSON.')
  }

  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => JSON_ESCAPES[character])
}

/**
 * Create a complete application/json script element with an optional id.
 *
 * @param {unknown} value
 * @param {{ id?: string, replacer?: ((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[], space?: string | number }} [options]
 * @returns {string}
 */
export function createInlineJsonScript(value, options) {
  const normalizedOptions = assertOptions(options)
  const { id, replacer, space } = normalizedOptions

  if (id !== undefined && (typeof id !== 'string' || id.length === 0)) {
    throw new TypeError('The script id must be a non-empty string when provided.')
  }

  const idAttribute = id === undefined ? '' : ` id="${escapeHtmlAttribute(id)}"`
  const serialized = serializeInlineJson(value, { replacer, space })

  return `<script type="application/json"${idAttribute}>${serialized}</script>`
}
