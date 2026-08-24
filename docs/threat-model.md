# Threat model

## Protected use case

An application needs to place a JSON value inside the text content of an HTML
`script` element and later recover that value with `textContent` and
`JSON.parse`.

```text
potentially attacker-controlled JSON value
              │
              ▼
       application process
              │ JSON.stringify
              ▼
    inline-json-for-html escaping
              │
              ▼
  script-element raw-text content
              │ textContent
              ▼
           JSON.parse
```

## Assets

- The integrity of the surrounding HTML document.
- The boundary between inert JSON data and executable or parsed HTML.
- The exact JSON value received by the intended consumer.
- Application and user data contained in the serialized value.

## Attacker capabilities considered

The attacker may control string keys and values inside the input, including:

- mixed-case `</script>` sequences;
- new markup or script openers;
- HTML comments and character references;
- U+2028 and U+2029 separators;
- values returned by a replacer or `toJSON` method.

The attacker is not assumed to control the surrounding element, its
attributes, the template source, the response headers, or the consumer code.

## Security control

The package first delegates JSON semantics to native `JSON.stringify`. It then
replaces every literal `<`, `>`, `&`, U+2028, and U+2029 in the serialized text
with a JSON Unicode escape. Because the serialized output contains no literal
`<`, it cannot contain an HTML end-tag opener.

The escapes remain valid JSON and reconstruct the original characters when
parsed.

## Trust assumptions

- The surrounding HTML element and its attributes are created safely.
- The output is inserted only as script-element text.
- The consumer reads `textContent` and calls `JSON.parse`.
- Native `JSON.stringify` and `JSON.parse` behave according to the supported
  JavaScript runtime.
- Replacer callbacks, getters, and `toJSON` methods are trusted application
  code. They execute before the final escaping pass and may have side effects.

## Non-goals

This package does not protect:

- HTML attributes, including an `id`, nonce, or data attribute;
- executable JavaScript source or JSONP;
- event-handler attributes;
- arbitrary HTML or rich text;
- CSS values or style elements;
- URLs or URL components;
- unsafe DOM sinks such as `innerHTML`;
- compromised templates, servers, browsers, or dependencies outside this
  package;
- confidentiality of data delivered in the HTML document.

It is not an HTML sanitizer and does not replace Content Security Policy,
output encoding for other contexts, input validation, or access control.

## Misuse cases

| Misuse | Why it is unsafe | Safer direction |
| --- | --- | --- |
| Place output inside a quoted attribute | Attribute parsing has a different grammar | Encode for that attribute context |
| Assign output to `innerHTML` | The browser parses it as markup | Use `textContent` or a reviewed sanitizer |
| Execute output as JavaScript | JSON data and JavaScript source have different boundaries | Parse with `JSON.parse` |
| Put secrets in embedded JSON | Page recipients can read the document | Keep secrets server-side |
| Treat escaping as input validation | Escaping does not enforce business rules | Validate data separately |

## Residual risks and review triggers

A new embedding context, new parser, browser-specific workaround, alternate
serializer, streaming implementation, or change to the escaped character set
requires a new threat-model review. Tests alone do not authorize expanding the
documented security boundary.
