import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const changelog = await readFile(resolve(root, 'CHANGELOG.md'), 'utf8')
const expectedTag = `v${packageJson.version}`
const actualTag = process.argv[2] ?? process.env.GITHUB_REF_NAME

if (!actualTag) {
  throw new Error('Provide a release tag as GITHUB_REF_NAME or the first argument.')
}

if (actualTag !== expectedTag) {
  throw new Error(`Tag ${actualTag} does not match package version ${expectedTag}.`)
}

if (!changelog.includes(`## ${packageJson.version} -`)) {
  throw new Error(`CHANGELOG.md has no dated section for ${packageJson.version}.`)
}

process.stdout.write(`Verified release metadata for ${expectedTag}.\n`)
