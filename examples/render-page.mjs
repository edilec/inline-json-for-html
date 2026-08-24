import { serializeInlineJson } from '../index.mjs'

const pageData = {
  title: 'Inline JSON example',
  message: '</script><script>alert("not executed")</script>',
  tags: ['security', 'JSON', 'HTML'],
}

const serialized = serializeInlineJson(pageData, { space: 2 })
const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Inline JSON example</title></head>
  <body>
    <script type="application/json" id="page-data">${serialized}</script>
  </body>
</html>`

process.stdout.write(`${html}\n`)
