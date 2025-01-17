/** Actually private definitions.
  * Not part of the TS *or* JS public API,
  * i.e. not accessible at all outside the package. */
import portManager from '@hackbg/port'
import { Path, SyncFS, FileFormat, XDG } from '@hackbg/file'
import { bold, colors, randomColor, randomBase16, Connection, Identity, Console } from '@hackbg/fadroma'
import * as OCI from '@fadroma/oci'
import Error from './devnet-error'
import type { DevnetContainer } from './devnet-base'
import type { APIMode } from './devnet-base'
import platforms from './devnet-platform'

const ENTRYPOINT_MOUNTPOINT = '/devnet.init.mjs'

/** Pick only the properties of a DevnetContainer that are used in a given function. */
type $D<
  C extends Connection,
  I extends Identity,
  T extends keyof DevnetContainer<C, I>
> = Pick<
  DevnetContainer<C, I>,
  T
>

export function initPort (
  devnet: $D<Connection, Identity, 'nodePortMode'|'nodePort'>
) {
  if (devnet.nodePortMode) {
    devnet.nodePort ??= defaultPorts[devnet.nodePortMode]
  }
  return devnet
}

export function initChainId (
  devnet: $D<Connection, Identity, 'chainId'|'platformName'|'platformVersion'>
) {
  if (!devnet.chainId) {
    devnet.chainId = 'dev'
    if (devnet.platformName) {
      devnet.chainId += `-${devnet.platformName}`
    }
    if (devnet.platformVersion) {
      devnet.chainId += `-${devnet.platformVersion}`
    }
    devnet.chainId += `-${randomBase16(4).toLowerCase()}`
  }
  return devnet
}

export function initLogger (
  devnet: $D<Connection, Identity, 'chainId'|'log'>
) {
  const devnetTag   = colors.bgWhiteBright.black(` creating `)
  const loggerColor = randomColor({ luminosity: 'dark', seed: devnet.chainId })
  const loggerTag   = colors.whiteBright.bgHex(loggerColor)(` ${devnet.chainId} `)
  const logger      = new Console(`${devnetTag} ${loggerTag}`)
  Object.defineProperties(devnet, {
    log: {
      enumerable: true, configurable: true, get () {
        return logger
      }, set () {
        throw new Error("can't change devnet logger")
      }
    }
  })
  return devnet
}

export function initState (
  devnet: $D<Connection, Identity, 'stateRoot'|'chainId'|'stateFile'|'runFile'>,
  { stateRoot }: Partial<typeof devnet>
) {
  const dataDir = XDG({ expanded: true, subdir: 'fadroma' }).data.home
  const path = stateRoot ?? new Path(dataDir, 'devnets').absolute
  devnet.stateRoot = new SyncFS.Directory(path)
  return devnet
}

export function initDynamicUrl (
  devnet: $D<Connection, Identity, 'log'|'url'|'nodeProtocol'|'nodeHost'|'nodePort'>
) {
  Object.defineProperties(devnet, {
    url: {
      enumerable: true, configurable: true, get () {
        let url = `${devnet.nodeProtocol}://${devnet.nodeHost}:${devnet.nodePort}`
        try {
          return new URL(url).toString()
        } catch (e) {
          devnet.log.error(`Invalid URL: ${url}`)
          throw e
        }
      }, set () {
        throw new Error("can't change devnet url")
      }
    },
  })
  return devnet
}

export function initContainer (
  devnet:
    & Parameters<typeof createDevnetContainer>[0]
    & Parameters<typeof startDevnetContainer>[0]
    & Parameters<typeof pauseDevnetContainer>[0]
    & Parameters<typeof removeDevnetContainer>[0]
) {

  if (!devnet.container) {
    throw new Error('At least devnet.container.image.name needs to be specified')
  }

  if (!(devnet.container.image instanceof OCI.OCIImage)) {
    devnet.container.image = new OCI.OCIImage(devnet.container.image)
  }
  devnet.container.image.log.label = devnet.log.label

  if (!(devnet.container instanceof OCI.OCIContainer)) {
    devnet.container = new OCI.OCIContainer(devnet.container)
  }
  devnet.container.log.label = devnet.log.label

  if (!devnet.container.image.engine || !devnet.container.engine) {
    devnet.container.engine = devnet.container.image.engine =
      new OCI.OCI().getConnection()
  }

  const defineGetter = (name: string, get: () => any) =>
    Object.defineProperty(devnet, name, {
      enumerable: true, configurable: true, get
    })
  defineGetter('created', function doCreateDevnetContainer () {
    const creating = createDevnetContainer(devnet)
    defineGetter('created', () => creating)
    return creating
  })
  defineGetter('started', function doStartDevnetContainer () {
    const starting = startDevnetContainer(devnet)
    defineGetter('started', () => starting)
    return starting
  })
  defineGetter('paused', function doPauseDevnetContainer () {
    const pausing = pauseDevnetContainer(devnet)
    defineGetter('paused', () => pausing)
    return pausing
  })
  defineGetter('removed', function doRemoveDevnetContainer () {
    const deleting = removeDevnetContainer(devnet)
    defineGetter('removed', () => deleting)
    return deleting
  })
  return devnet
}

export async function createDevnetContainer (
  devnet:
    & Parameters<typeof saveDevnetState>[0]
    & Parameters<typeof containerOptions>[0]
    & Parameters<typeof setExitHandler>[0]
    & $D<Connection, Identity, 'container'|'verbose'|'initScript'|'url'>
) {
  devnet.log.label = devnet.container.log.label
  if (await devnet.container.exists()) {
    devnet.log(`Found`, bold(devnet.chainId), `in container`, bold(devnet.container.shortId))
  } else {
    if (devnet.verbose) {
      devnet.log.debug('Creating container for', bold(devnet.chainId))
    }
    // ensure we have image and chain id
    if (!devnet.container.image) {
      throw new Error("Can't create devnet without container image")
    }
    if (!devnet.chainId) {
      throw new Error("Can't create devnet without chain ID")
    }
    // if port is unspecified or taken, increment
    devnet.nodePort = await portManager.getFreePort(devnet.nodePort)
    // create container
    if (devnet.verbose) {
      devnet.log(`Creating devnet`, bold(devnet.chainId), `on`, bold(String(devnet.url)))
    }
    devnet.container.name    = devnet.chainId
    devnet.container.options = containerOptions(devnet)
    devnet.container.command = [ENTRYPOINT_MOUNTPOINT, devnet.chainId]
    await devnet.container.create()
    devnet.container.log.label = devnet.log.label = OCI.toLogLabel(devnet.container)
    // set id and save
    if (devnet.verbose) {
      devnet.log.debug(`Created container:`, bold(devnet.container.shortId))
    }
    await saveDevnetState(devnet)
    if (devnet.verbose) {
      devnet.log.debug(`Saved devnet receipt.`)
    }
  }
  return devnet
}

/** Options for the devnet container. */
export function containerOptions (
  devnet: $D<
    Connection, Identity,
    'chainId'|'initScript'|'stateRoot'|'nodePort'|'platformName'|'platformVersion'|'chainId'
  > & Parameters<typeof containerEnvironment>[0]
) {
  return {
    env:              containerEnvironment(devnet),
    exposed:          [`${devnet.nodePort}/tcp`],
    extra:            {
      Tty:            true,
      AttachStdin:    true,
      AttachStdout:   true,
      AttachStderr:   true,
      Hostname:       devnet.chainId,
      Domainname:     devnet.chainId,
      HostConfig:     {
        Binds:        [
          `${new Path(devnet.stateRoot).absolute}:/state:rw`,
          devnet.initScript ? `${devnet.initScript.absolute}:${ENTRYPOINT_MOUNTPOINT}:ro` : null,
        ].filter(Boolean),
        NetworkMode:  'bridge',
        PortBindings: {
          [`${devnet.nodePort}/tcp`]: [{HostPort: `${devnet.nodePort}`}]
        },
        AutoRemove:   false,
      },
      Labels:         {
        "tech.fadroma.devnet.platformName":    devnet.platformName,
        "tech.fadroma.devnet.platformVersion": devnet.platformVersion,
        "tech.fadroma.devnet.chainId":         devnet.chainId,
      }
    }
  }
}

/** Environment variables in the devnet container. */
export function containerEnvironment (
  devnet: $D<
    Connection, Identity,
    'log'|'chainId'|'gasToken'|'nodeBinary'|'nodePortMode'|'nodePort'|'genesisAccounts'|'verbose'
  >
) {
  const env: Record<string, string|undefined> = {
    DAEMON:    devnet.nodeBinary||'',
    TOKEN:     devnet.gasToken?.denom,
    CHAIN_ID:  devnet.chainId!,
    ACCOUNTS:  JSON.stringify(devnet.genesisAccounts),
    STATE_UID: String((process.getuid!)()),
    STATE_GID: String((process.getgid!)()),
  }
  if (devnet.verbose) {
    env['VERBOSE'] = 'yes'
  }
  const portVar = portVars[devnet.nodePortMode!]
  if (portVar) {
    env[portVar] = String(devnet.nodePort)
  } else {
    devnet.log.warn(`Unknown port mode "${devnet.nodePortMode}", devnet may not be accessible.`)
  }
  if (devnet.verbose) {
    for (const [key, val] of Object.entries(env)) {
      devnet.log.debug(`  ${key}=${val}`)
    }
  }
  return env
}

export async function removeDevnetContainer (
  devnet: $D<
    Connection, Identity, 'log'|'container'|'stateRoot'|'paused'
  > & Parameters<typeof forceDelete>[0]
) {
  devnet.log.label = devnet.container.log.label
  try {
    if (devnet.container && await devnet.container?.isRunning) {
      if (await devnet.container.isRunning) {
        await devnet.paused
      }
      await devnet.container.remove()
    }
  } catch (e: any) {
    if (e.statusCode !== 404) {
      throw e
    }
  }
  //const state = new SyncFS.Directory(devnet.stateRoot)
  //const path = state.short
  //try {
    //if (state.exists()) {
      //devnet.log(`Deleting ${path} ...`)
      ////state.delete()
    //}
  //} catch (e: any) {
    //if (e.code === 'EACCES' || e.code === 'ENOTEMPTY') {
      //devnet.log.warn(`unable to delete ${path}: ${e.code}, trying cleanup container`)
      //await forceDelete(devnet)
    //} else {
      //devnet.log.error(`failed to delete ${path}:`, e)
      //throw e
    //}
  //}
  return devnet
}

/** Run the cleanup container, deleting devnet state even if emitted as root. */
export async function forceDelete (
  devnet: $D<Connection, Identity, 'stateRoot'|'container'|'chainId'|'log'>
) {
  const path = new SyncFS.Path(devnet.stateRoot)
  devnet.log('Running cleanup container for', path.short)
  const cleanupContainer = await devnet.container.image.run({
    name: `${devnet.chainId}-cleanup`,
    entrypoint: '/bin/rm',
    command: ['-rvf', '/state'],
    options: {
      extra: {
        AutoRemove: true,
        HostConfig: { Binds: [`${path.absolute}:/state:rw`] }
      }
    },
  })
  await cleanupContainer.start()
  devnet.log('Waiting for cleanup container to finish...')
  await cleanupContainer.wait()
  devnet.log(`Deleted ${path.short}/* via cleanup container.`)
  //$(devnet.stateRoot).delete()
}

/** Write the state of the devnet to a file.
  * This saves the info needed to respawn the node */
async function saveDevnetState (devnet: $D<
  Connection, Identity,
  'platformName'|'platformVersion'|'chainId'|'container'|'nodePort'
> & {
  stateFile: { save (data: object) }
}) {
  devnet.stateFile.save({
    platformName:    devnet.platformName,
    platformVersion: devnet.platformVersion,
    image:           devnet.container.image.name,
    container:       devnet.container.id,
    nodePort:        devnet.nodePort,
  })
}

export async function startDevnetContainer (
  devnet: Parameters<typeof createDevnetContainer>[0] & $D<
    Connection, Identity,
    |'log'|'running'|'container'|'waitString'|'waitMore'
    |'nodeHost'|'nodePort'|'chainId'|'waitPort'|'created'
  >
) {
  devnet.log.label = devnet.container.log.label
  if (!devnet.running) {
    setExitHandler(devnet)
    devnet.running = true
    devnet.log.debug(`Starting container`)
    await devnet.container.start()
    devnet.log.debug('Waiting for container to say:', bold(devnet.waitString))
    await devnet.container.waitLog(devnet.waitString, (_)=>true, true)
    devnet.log.debug('Waiting for', bold(String(devnet.waitMore)), 'seconds...')
    await new Promise(resolve=>setTimeout(resolve, devnet.waitMore))
    devnet.log.debug(`Waiting for ${bold(devnet.nodeHost)}:${bold(String(devnet.nodePort))} to open...`)
    await devnet.waitPort({ host: devnet.nodeHost, port: Number(devnet.nodePort) })
  } else {
    devnet.log.log('Container already starting:', bold(devnet.chainId))
  }
  return devnet
}

// Set an exit handler on the process to let the devnet
// stop/remove its container if configured to do so
export function setExitHandler (devnet: Parameters<typeof defineExitHandler>[0]) {
  if (!devnet.exitHandler) {
    //devnet.log.debug('Registering exit handler')
    devnet.exitHandler = defineExitHandler(devnet)
    for (const event of [
      'exit',
      'beforeExit',
      'uncaughtExceptionMonitor',
      'unhandledRejection',
      'SIGTERM',
      'SIGINT',
      'SIGBREAK',
    ]) {
      process.on(event, devnet.exitHandler)
    }
  } else {
    devnet.log.warn('Exit handler already registered')
  }
}

function defineExitHandler (devnet: $D<
  Connection, Identity,
  'log'|'onScriptExit'|'runFile'|'chainId'|'nodePort'|'exitHandler'|'container'|'url'|'stateDir'
>) {
  let called = false
  return function exitHandler (
    this: Parameters<typeof defineExitHandler>[0],
    ...args: unknown[]
  ) {
    try {
      if (called) {
        return
      }
      called = true
      //this.log.debug(`Running exit handler for ${bold(this.chainId)}`)
      if (this.onScriptExit === 'remove' || this.onScriptExit === 'pause') {
        this.log.log(`Stopping ${bold(this.chainId)}`)
        devnet.runFile.delete()
      } else {
        this.log.br().info(`Devnet is running on ${bold(String(devnet.url))}`)
      }
      //this.log.debug('Exit handler complete.')
    } catch (e) {
      this.log
        .error(e)
        .warn('Exit handler failed. You may need to stop or remove the devnet manually.')
        .info('See above for details. To check for running devnets, try:')
        .info('  $ docker ps')
    }
  }.bind(devnet)
}

export async function pauseDevnetContainer (
  devnet: $D<Connection, Identity, 'log'|'container'|'running'|'runFile'>
) {
  devnet.log.label = devnet.container.log.label
  if (await devnet.container.exists()) {
    devnet.log.debug(`Stopping container:`, bold(devnet.container.shortId))
    try {
      if (await devnet.container.isRunning()) {
        await devnet.container.kill()
      }
    } catch (e) {
      if (e.statusCode == 404) {
        devnet.log.warn(`Container ${bold(devnet.container.shortId)} not found`)
      } else {
        throw e
      }
    }
  }
  devnet.running = false
  devnet.runFile.delete()
  return devnet
}

export async function connect <C extends Connection, I extends Identity> (
  devnet:      $D<C, I, 'chainId'|'started'|'url'|'running'> & Parameters<typeof getIdentity>[0],
  $Connection: { new (...args: unknown[]): C },
  $Identity:   { new (...args: unknown[]): I },
  parameter:   string|Partial<I & { name?: string, mnemonic?: string }> = {}
): Promise<C> {
  if (typeof parameter === 'string') {
    parameter = { name: parameter } as Partial<I & { name?: string, mnemonic?: string }>
  }
  await devnet.created
  await devnet.started
  return new $Connection({
    chainId:  devnet.chainId,
    url:      devnet.url?.toString(),
    alive:    devnet.running,
    identity: new $Identity(parameter.mnemonic
      ? parameter as { mnemonic: string }
      : await getIdentity(devnet, parameter))
  })
}

export async function getIdentity <C extends Connection, I extends Identity> (
  devnet: $D<C, I, 'log'|'stateDir'|'created'|'started'>,
  name:   string|{name?: string}
) {
  if (typeof name === 'object') {
    name = name.name!
  }
  if (!name) {
    throw new Error('no name')
  }
  devnet.log.debug('Connecting as genesis account:', bold(name))
  if (!new SyncFS.Directory(devnet.stateDir).exists()) {
    await devnet.created
    await devnet.started
  }
  return new SyncFS.File(devnet.stateDir, 'wallet', `${name}.json`)
    .setFormat(FileFormat.JSON)
    .load() as Partial<I> & { mnemonic: string }
}

/** Mapping of connection type to environment variable
  * used by devnet.init.mjs to set port number. */
const portVars: Record<APIMode, string> = {
  http: 'HTTP_PORT', grpc: 'GRPC_PORT', grpcWeb: 'GRPC_WEB_PORT', rpc: 'RPC_PORT',
}

/** Default port numbers for each kind of port. */
export const defaultPorts: Record<APIMode, number> = {
  http: 1317, grpc: 9090, grpcWeb: 9091, rpc: 26657
}
