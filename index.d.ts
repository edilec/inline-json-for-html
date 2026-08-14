export type InlineJsonReplacer =
  | ((this: unknown, key: string, value: unknown) => unknown)
  | readonly (string | number)[]

export interface SerializeInlineJsonOptions {
  replacer?: InlineJsonReplacer
  space?: string | number
}

export interface CreateInlineJsonScriptOptions extends SerializeInlineJsonOptions {
  id?: string
}

export declare function serializeInlineJson(
  value: unknown,
  options?: SerializeInlineJsonOptions,
): string

export declare function createInlineJsonScript(
  value: unknown,
  options?: CreateInlineJsonScriptOptions,
): string
