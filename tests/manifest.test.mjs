import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')
const manifest = JSON.parse(await read('../manifest.json'))
const pkg = JSON.parse(await read('../package.json'))
const sdkPkg = createRequire(import.meta.url)('@nonsplayer/plugin-sdk/package.json')
const lock = await read('../pnpm-lock.yaml')

test('manifest requires plugin API 3 and keeps local-only networking defaults', () => {
  assert.equal(manifest.version, '2.0.0')
  assert.equal(pkg.version, manifest.version)
  assert.equal(manifest.engines.pluginApi, '^3.0.0')
  assert.equal(manifest.engines.uiApi, '^3.0.0')
  assert.equal(sdkPkg.version, '3.0.0')
  assert.equal(sdkPkg.nons.pluginApi, '3.0.0')
  assert.equal(sdkPkg.nons.uiApi, '3.0.0')
  assert.equal(manifest.httpHosts, undefined)
  assert.equal(manifest.websocketHosts, undefined)
  assert.equal(manifest.coverHosts, undefined)
  assert.ok(manifest.permissions.every((permission) => !permission.startsWith('http:')))
  assert.ok(manifest.permissions.includes('window:manage'))
})

test('SDK resolves from the published package without a host checkout', () => {
  const sdk = '3.0.0'
  assert.equal(pkg.devDependencies['@nonsplayer/plugin-sdk'], sdk)
  assert.ok(lock.includes(`'@nonsplayer/plugin-sdk@${sdk}':`))
  assert.ok(!lock.includes('@nonsplayer/plugin-sdk@file:'))
  assert.ok(!lock.includes('patch_hash'))
})
