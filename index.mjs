const JSON_ESCAPES = Object.freeze({
  '<': '\\u003C',
  '>': '\\u003E',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
})

const UNSUPPORTED_HANDLING = Object.freeze(['omit', 'throw'])
const OPTION_KEYS = Object.freeze(['replacer', 'space', 'onUnsupported'])

function assertOptions(options) {
  if (options === undefined) return {}

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object when provided.')
  }
  let keys
  let descriptors
  try {
    if (![Object.prototype, null].includes(Object.getPrototypeOf(options))) {
      throw new TypeError('Options must be a plain object.')
    }
    keys = Reflect.ownKeys(options)
    descriptors = Object.getOwnPropertyDescriptors(options)
  } catch {
    throw new TypeError('Options must be a plain object with data properties.')
  }
  const selected = {}
  for (const key of keys) {
    if (typeof key !== 'string' || !OPTION_KEYS.includes(key)) {
      throw new TypeError('Unknown option.')
    }
    const descriptor = descriptors[key]
    if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) {
      throw new TypeError('Options must use enumerable data properties.')
    }
    selected[key] = descriptor.value
  }
  return selected
}

function assertSpace(space) {
  if (
    space !== undefined &&
    (!Number.isInteger(space) || space < 0 || space > 10)
  ) {
    throw new TypeError('Space must be an integer from 0 through 10 when provided.')
  }
}

function assertUnsupported(onUnsupported) {
  if (
    onUnsupported !== undefined &&
    !UNSUPPORTED_HANDLING.includes(onUnsupported)
  ) {
    throw new TypeError("Option onUnsupported must be 'omit' or 'throw' when provided.")
  }
}

/**
 * Classify a value that JSON cannot represent.
 *
 * `undefined` is a representable absence; a function or symbol is an
 * unsupported type. JSON.stringify treats both the same way — omitted in an
 * object, `null` in an array — so the distinction is made here.
 *
 * @returns {'undefined' | 'function' | 'symbol' | null} null when representable
 */
function categorize(value) {
  if (value === undefined) return 'undefined'

  const type = typeof value
  if (type === 'function' || type === 'symbol') return type

  return null
}

function childPath(holderPath, holder, key) {
  if (Array.isArray(holder)) return `${holderPath}[${key}]`
  return holderPath === '' ? key : `${holderPath}.${key}`
}

/**
 * Wrap a replacer so that values JSON cannot represent are reported with their
 * location instead of being dropped. Only used when `onUnsupported` is
 * `'throw'`; otherwise the caller's replacer is passed through untouched so
 * native behaviour is preserved exactly.
 */
function strictReplacer(replacer) {
  const paths = new WeakMap()
  let rootSeen = false

  return function trackingReplacer(key, entry) {
    const next = replacer === undefined ? entry : replacer.call(this, key, entry)

    // JSON.stringify also permits an ordinary property named ''. Only its
    // first callback is the wrapper root, regardless of later property keys.
    if (!rootSeen) {
      rootSeen = true
      if (next !== null && typeof next === 'object') paths.set(next, '')
      return next
    }

    // Every holder reached here was registered before JSON.stringify recursed
    // into it: the root is registered on the key === '' call above, and each
    // nested object is registered below before it becomes a holder in turn.
    const path = childPath(paths.get(this), this, key)
    const category = categorize(next)

    if (category !== null) {
      throw new TypeError(
        `Cannot represent the ${category} value at ${path} as JSON; ` +
          "remove it or serialize with onUnsupported: 'omit'.",
      )
    }

    if (next !== null && typeof next === 'object') paths.set(next, path)

    return next
  }
}

function topLevelMessage(value, hasFunctionReplacer) {
  if (hasFunctionReplacer) {
    return 'The top-level value cannot be represented as JSON.'
  }

  const category = value === undefined ? 'undefined' : typeof value

  return category === 'undefined'
    ? 'The top-level value is undefined and cannot be represented as JSON.'
    : `The top-level value is an unsupported ${category} and cannot be represented as JSON.`
}

/**
 * Serialize a value as JSON that can be placed in the raw-text content of an
 * HTML script element.
 *
 * @param {unknown} value
 * @param {{ replacer?: ((this: unknown, key: string, value: unknown) => unknown) | readonly (string | number)[], space?: number, onUnsupported?: 'omit' | 'throw' }} [options]
 * @returns {string}
 */
export function serializeInlineJson(value, options) {
  const { replacer, space, onUnsupported } = assertOptions(options)
  assertSpace(space)
  assertUnsupported(onUnsupported)

  const strict = onUnsupported === 'throw'
  const arrayReplacer = Array.isArray(replacer)

  if (strict && arrayReplacer) {
    throw new TypeError(
      "Option onUnsupported: 'throw' requires a function replacer or no replacer, " +
        'because a property allowlist omits properties by design.',
    )
  }

  const effectiveReplacer = strict ? strictReplacer(replacer) : replacer
  const serialized = JSON.stringify(value, effectiveReplacer, space)

  if (serialized === undefined) {
    throw new TypeError(
      topLevelMessage(value, !arrayReplacer && typeof replacer === 'function'),
    )
  }

  return serialized.replace(/[<>&\u2028\u2029]/g, (character) => JSON_ESCAPES[character])
}
