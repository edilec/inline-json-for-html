import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const documents = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'MAINTAINERS.md',
  'docs/architecture.md',
  'docs/compatibility.md',
  'docs/releasing.md',
  'docs/threat-model.md',
]
const failures = []

for (const document of documents) {
  const documentPath = resolve(root, document)
  const markdown = await readFile(documentPath, 'utf8')
  const links = markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)

  for (const [, target] of links) {
    if (/^(?:https?:|mailto:|#)/.test(target)) continue

    const withoutFragment = target.split('#', 1)[0]
    if (!withoutFragment) continue

    const targetPath = resolve(dirname(documentPath), decodeURIComponent(withoutFragment))
    try {
      await access(targetPath)
    } catch {
      failures.push(`${document}: ${target}`)
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Broken local documentation links:\n${failures.join('\n')}`)
}

process.stdout.write(`Checked local links in ${documents.length} documents.\n`)
