import { Suite } from '@hackbg/ensuite'
import { OCI, OCIConnection, OCIContainer, OCIImage } from './oci'
import { randomBase16 } from '@hackbg/fadroma'
import * as assert from 'node:assert'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default new Suite([
  ['real', testContainerEngine],
])

export async function testContainerEngine () {

  const engine = new OCI({ chainId: 'test' })
  const image = engine.image('hello-world')
  assert.ok(image instanceof OCIImage)
  assert.ok(image.engine instanceof OCIConnection)

  console.log('Pull or build...')
  await image.pullOrBuild()

  console.log('Check...')
  await image.assertExists()

  console.log('Pull...')
  await image.pull()
  image.dockerfile = resolve(dirname(fileURLToPath(import.meta.url)), 'oci.test.Dockerfile')

  console.log('Build...')
  await image.build()
  const container = image.container(`test-hello-${randomBase16()}`)
  assert.ok(container instanceof OCIContainer)
  assert.equal(container.image, image)

  console.log('Create container...')
  assert.equal(await container.exists(), false)
  await container.create()
  assert.ok(container.id)
  assert.equal(await container.exists(), true)
  assert.equal(container.shortId, container.id.slice(0, 8))
  assert.equal(await container.isRunning(), false)

  console.log('List all containers by image...')
  await image.getInstances({ all: true })

  console.log('Start container...')
  await container.start()

  console.log('List running containers by image...')
  await image.getInstances({})
  assert.ok(await container.ip())
  assert.equal(await container.isRunning(), true)

  console.log('Kill container...')
  await container.kill()

  console.log('List running containers by image...')
  await image.getInstances({})

  console.log('List all containers by image...')
  await image.getInstances({ all: true })
  assert.equal(await container.isRunning(), false)

  //console.log('Remove container...')
  //await container.remove()
  //assert.equal(await container.exists(), false)
  //console.log('List all containers by image...')
  //await image.getInstances({ all: true })
}
