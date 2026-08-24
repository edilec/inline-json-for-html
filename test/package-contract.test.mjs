import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import test from 'node:test'

const execFileAsync = promisify(execFile)

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

test('uses an explicit release tag instead of the workflow branch name', async () => {
  const verifyScript = fileURLToPath(
    new URL('../scripts/verify-release.mjs', import.meta.url),
  )
  const { stdout } = await execFileAsync(process.execPath, [verifyScript, 'v0.1.1'], {
    env: { ...process.env, GITHUB_REF_NAME: 'main' },
  })

  assert.equal(stdout, 'Verified release metadata for v0.1.1.\n')
})
