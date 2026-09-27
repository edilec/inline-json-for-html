export type InlineJsonReplacer =
  | ((this: unknown, key: string, value: unknown) => unknown)
  | readonly (string | number)[]

/**
 * How to treat values JSON cannot represent (`undefined`, functions, symbols)
 * below the top level.
 *
 * - `'omit'` (default) keeps native `JSON.stringify` behaviour: the property is
 *   omitted from an object and becomes `null` in an array.
 * - `'throw'` reports the value and its path instead of dropping it. Requires a
 *   function replacer or no replacer.
 */
export type InlineJsonUnsupportedHandling = 'omit' | 'throw'

export interface SerializeInlineJsonOptions {
  replacer?: InlineJsonReplacer
  space?: number
  onUnsupported?: InlineJsonUnsupportedHandling
}

export declare function serializeInlineJson(
  value: unknown,
  options?: SerializeInlineJsonOptions,
): string
