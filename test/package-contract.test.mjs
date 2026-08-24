import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)

test('publishes one explicit ESM entry with bundled declarations', () => {
  assert.equal(packageJson.type, 'module')
  assert.equal(packageJson.exports['.'].import, './index.mjs')
  assert.equal(packageJson.exports['.'].types, './index.d.ts')
  assert.equal(packageJson.types, './index.d.ts')
  assert.equal(packageJson.exports['.'].require, undefined)
})

test('keeps the runtime dependency-free and declares the tested Node floor', () => {
  assert.equal(packageJson.engines.node, '>=22')
  assert.equal(packageJson.dependencies, undefined)
  assert.equal(packageJson.optionalDependencies, undefined)
  assert.equal(packageJson.peerDependencies, undefined)
})
