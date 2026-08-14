export type InlineJsonReplacer =
  | ((this: unknown, key: string, value: unknown) => unknown)
  | readonly (string | number)[]

export interface SerializeInlineJsonOptions {
  replacer?: InlineJsonReplacer
  space?: number
}

export declare function serializeInlineJson(
  value: unknown,
  options?: SerializeInlineJsonOptions,
): string
