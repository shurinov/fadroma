import { hideProperties as hide } from '@hackbg/hide'
import { Writable, Transform } from 'node:stream'
import { basename, dirname } from 'node:path'
import Docker from 'dockerode'
import {
  bold,
  Error,
  Console,
  Backend,
  Connection,
  ContractTemplate,
  ContractInstance
} from '@fadroma/agent'
import { LineTransformStream } from './oci-stream'
import * as Mock from './oci-mock'

export class OCIError extends Error {
  static NoDockerode = this.define('NoDockerode',
    ()=>'Dockerode API handle not set'
  )
  static NotDockerode = this.define('NotDockerode',
    ()=>'DockerImage: pass a Dock.DockerEngine instance'
  )
  static NoNameNorDockerfile = this.define('NoNameNorDockerfile',
    ()=>'DockerImage: specify at least one of: name, dockerfile'
  )
  static NoDockerfile = this.define('NoDockerfile',
    ()=>'No dockerfile specified'
  )
  static NoImage = this.define('NoImage',
    ()=>'No image specified'
  )
  static NoContainer = this.define('NoContainer',
    ()=>'No container'
  )
  static ContainerAlreadyCreated = this.define('ContainerAlreadyCreated',
    ()=>'Container already created'
  )
  static NoName = this.define('NoName',
    (action: string) => `Can't ${action} image with no name`
  )
  static PullFailed = this.define('PullFailed',
    (name: string) => `Pulling ${name} failed.`
  )
  static BuildFailed = this.define('BuildFailed',
    (name: string, dockerfile: string, context: string) => (
      `Building ${name} from ${dockerfile} in ${context} failed.`
    )
  )
}

export class OCIConsole extends Console {
  label = '@fadroma/oci'

  ensuring = () =>
    this //this.info('Ensuring that the image exists')
  imageExists = () =>
    this // this.info('Image exists')
  notCachedPulling = () =>
    this.log('Not cached, pulling')
  notFoundBuilding = (msg: string) =>
    this.log(`Not found in registry, building (${msg})`)
  buildingFromDockerfile = (file: string) =>
    this.log(`Using dockerfile:`, bold(file))
  creatingContainer (name?: string) {
    return this.log(`Creating container`, bold(name))
  }
  boundPort (containerPort: any, hostPort: any) {
    return this.debug(`port localhost:${bold(hostPort)} => :${bold(containerPort)}`)
  }
  boundVolumes (binds: any[]) {
    return this.debug('Mount volumes:\n ', binds
      .map(bind=>{
        const [ host, mount, mode = 'rw' ] = bind.split(':')
        return [ mode, bold(mount), '=\n    ', host ].join(' ')
      })
      .join('\n  ')
    )
  }
  createdWithWarnings = (id: string, warnings?: any) => {
    this.warn(`Warnings when creating ${bold(id)}`)
    if (warnings) {
      this.warn(warnings)
    }
    return this
  }
}

export const console = new OCIConsole('@fadroma/oci')

export class OCIEngine {
  static mock (callback?: Function) {
    return new this({
      name: 'mock',
      dockerode: Mock.mockDockerode(callback)
    })
  }

  /** By default, creates an instance of Dockerode
    * connected to env `DOCKER_HOST`. You can also pass
    * your own Dockerode instance or socket path. */
  constructor (options: string|{
    name: string,
    log?: Console,
    dockerode?: DockerHandle|string
  }) {
    if (!dockerode) {
      dockerode = new Docker({ socketPath: defaultSocketPath })
    } else if (typeof dockerode === 'object') {
      dockerode = dockerode
    } else if (typeof dockerode === 'string') {
      dockerode = new Docker({ socketPath: dockerode })
    } else {
      throw new OCIError('invalid docker engine configuration')
    }
    const api = dockerode.modem.host ?? dockerode.modem.socketPath
    if (typeof options === 'string') {
      options = { name: options }
    }
    this.name = options.name
    this.log  = options.log ?? new Console(`@fadroma/oci: ${this.name}`)
    hide(this, 'log')
    this.dockerode = dockerode
  }

  name:      string
  log:       Console
  dockerode: DockerHandle

  image (
    name:        string|null,
    dockerfile?: string|null,
    extraFiles?: string[]
  ): DockerImage {
    return new DockerImage(this, name, dockerfile, extraFiles)
  }

  async container (id: string): Promise<DockerContainer> {
    const container = await this.dockerode.getContainer(id)
    const info = await container.inspect()
    const image = this.image(info.Image)
    return Object.assign(new DockerContainer(
      image,
      info.Name,
      undefined,
      info.Args,
      info.Path
    ), { container })
  }
}

export class OCIImage {

  constructor (
    readonly engine:     Engine|null,
    readonly name:       string|null,
    readonly dockerfile: string|null = null,
    readonly extraFiles: string[]    = []
  ) {
    this.log = new Console(`Image(${bold(this.name)})`)
    hide(this, 'log')
  }

  log:
    Console

  /** Throws if inspected image does not exist locally. */
  abstract check ():
    Promise<void>

  abstract pull ():
    Promise<void>

  abstract build ():
    Promise<void>

  abstract run (
    name?:         string,
    options?:      Partial<ContainerOpts>,
    command?:      ContainerCommand,
    entrypoint?:   ContainerCommand,
    outputStream?: Writable
  ): Promise<Container>

  abstract container (
    name?:       string,
    options?:    Partial<ContainerOpts>,
    command?:    ContainerCommand,
    entrypoint?: ContainerCommand,
  ): Container

  protected _available:
    Promise<this>|null = null

  async ensure (): Promise<this> {
    this._available ??= new Promise(async(resolve, reject)=>{
      this.log.ensuring()
      try {
        await this.check()
        this.log.imageExists()
      } catch (e1) {
        if (e1.statusCode !== 404) return reject(e1)
        // if image doesn't exist locally, try pulling it
        try {
          this.log.notCachedPulling()
          await this.pull()
        } catch (e2) {
          this.log.error(e2)
          if (!this.dockerfile) {
            const NO_FILE  = `Unavailable and no Dockerfile provided; can't proceed.`
            reject(`${NO_FILE} (${e2.message})`)
          } else {
            this.log.notFoundBuilding(e2.message)
            this.log.buildingFromDockerfile(this.dockerfile)
            await this.build()
          }
        }
      }
      resolve(this)
    })
    return await Promise.resolve(this._available)
  }

  get [Symbol.toStringTag](): string { return this.name||'' }


  declare engine:
    DockerEngine

  get dockerode (): Docker {
    if (!this.engine || !this.engine.dockerode) {
      throw new OCIError.NoDockerode()
    }
    return this.engine.dockerode as unknown as Docker
  }

  async check () {
    if (!this.name) {
      throw new OCIError.NoName('inspect')
    }
    await this.dockerode.getImage(this.name).inspect()
  }

  /** Throws if inspected image does not exist in Docker Hub. */
  async pull () {
    const { name, dockerode } = this
    if (!name) {
      throw new OCIError.NoName('pull')
    }
    await new Promise<void>((ok, fail)=>{
      const log = new Console(`pulling docker image ${this.name}`)
      dockerode.pull(name, async (err: any, stream: any) => {
        if (err) return fail(err)
        await follow(dockerode, stream, (event) => {
          if (event.error) {
            log.error(event.error)
            throw new OCIError.PullFailed(name)
          }
          const data = ['id', 'status', 'progress'].map(x=>event[x]).join(' ')
          this.log.log(data)
        })
        ok()
      })
    })
  }

  /* Throws if the build fails, and then you have to fix stuff. */
  async build () {
    if (!this.dockerfile) {
      throw new OCIError.NoDockerfile()
    }
    if (!this.engine?.dockerode) {
      throw new OCIError.NoDockerode()
    }
    const { name, engine: { dockerode } } = this
    const dockerfile = basename(this.dockerfile)
    const context = dirname(this.dockerfile)
    const src = [dockerfile, ...this.extraFiles]
    const build = await dockerode.buildImage(
      { context, src },
      { t: this.name, dockerfile }
    )
    const log = new Console(`building docker image ${this.name}`)
    await follow(dockerode, build, (event) => {
      if (event.error) {
        log.error(event.error)
        throw new OCIError.BuildFailed(name??'(no name)', dockerfile, context)
      }
      const data = event.progress || event.status || event.stream || JSON.stringify(event) || ''
      console.log(data.trim())
    })
  }

  async run (
    name?:         string,
    options?:      Partial<ContainerOpts>,
    command?:      ContainerCommand,
    entrypoint?:   ContainerCommand,
    outputStream?: Writable
  ) {
    return await DockerContainer.run(
      this,
      name,
      options,
      command,
      entrypoint,
      outputStream
    )
  }

  container (
    name?:       string,
    options?:    Partial<ContainerOpts>,
    command?:    ContainerCommand,
    entrypoint?: ContainerCommand,
  ) {
    return new DockerContainer(
      this,
      name,
      options,
      command,
      entrypoint
    )
  }
}

/** Interface to a Docker container. */
export abstract class OCIContainer {

  constructor (
    readonly image:       Image,
    readonly name:        string|null = null,
    readonly options:     Partial<ContainerOpts> = {},
    readonly command?:    ContainerCommand,
    readonly entrypoint?: ContainerCommand
  ) {
    this.log = new Console(name ? `Container(${bold(name)})` : `container`)
    hide(this, 'log')
  }
  constructor (
    engine:     DockerEngine|null,
    name:       string|null,
    dockerfile: string|null = null,
    extraFiles: string[]    = []
  ) {
    if (engine && !(engine instanceof DockerEngine)) {
      throw new OCIError.NotDockerode()
    }
    if (!name && !dockerfile) {
      throw new OCIError.NoNameNorDockerfile()
    }
    super(engine, name, dockerfile, extraFiles)
  }

  log:
    Console

  static async create (
    image:       Image,
    name?:       string,
    options?:    Partial<ContainerOpts>,
    command?:    ContainerCommand,
    entrypoint?: ContainerCommand,
  ) {
    await image.ensure()
    const self = new (this as any)(image, name, options, command, entrypoint)
    await self.create()
    return self
  }

  static async run (
    image:         Image,
    name?:         string,
    options?:      Partial<ContainerOpts>,
    command?:      ContainerCommand,
    entrypoint?:   ContainerCommand,
    outputStream?: Writable
  ) {
    const self = await this.create(image, name, options, command, entrypoint)
    if (outputStream) {
      if (!self.container) {
        throw new OCIError.NoContainer()
      }
      const stream = await self.container.attach({ stream: true, stdin: true, stdout: true })
      stream.setEncoding('utf8')
      stream.pipe(outputStream, { end: true })
    }
    await self.start()
    return self
  }

  get [Symbol.toStringTag](): string { return this.name||'' }

  container: Docker.Container|null = null

  declare image: DockerImage

  get dockerode (): Docker {
    return this.image.dockerode as unknown as Docker
  }

  get dockerodeOpts (): Docker.ContainerCreateOptions {

    const {
      remove   = false,
      env      = {},
      exposed  = [],
      mapped   = {},
      readonly = {},
      writable = {},
      extra    = {},
      cwd
    } = this.options

    const config = {
      name: this.name,
      Image: this.image.name,
      Entrypoint: this.entrypoint,
      Cmd: this.command,
      Env: Object.entries(env).map(([key, val])=>`${key}=${val}`),
      WorkingDir: cwd,
      ExposedPorts: {} as Record<string, {}>,
      HostConfig: {
        Binds: [] as Array<string>,
        PortBindings: {} as Record<string, Array<{ HostPort: string }>>,
        AutoRemove: remove
      }
    }

    exposed
      .forEach(containerPort=>
        config.ExposedPorts[containerPort] = {})

    Object.entries(mapped)
      .forEach(([containerPort, hostPort])=>
        config.HostConfig.PortBindings[containerPort] = [{ HostPort: hostPort }])

    Object.entries(readonly)
      .forEach(([hostPath, containerPath])=>
        config.HostConfig.Binds.push(`${hostPath}:${containerPath}:ro`))

    Object.entries(writable)
      .forEach(([hostPath, containerPath])=>
        config.HostConfig.Binds.push(`${hostPath}:${containerPath}:rw`))

    return Object.assign(config, JSON.parse(JSON.stringify(extra)))

  }


  get id (): string {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    return this.container.id
  }

  get shortId (): string {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    return this.container.id.slice(0, 8)
  }

  get warnings (): string[] {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    return (this.container as any).Warnings
  }

  get isRunning (): Promise<boolean> {
    return this.inspect().then(state=>state.State.Running)
  }

  get ip (): Promise<string> {
    return this.inspect().then(state=>state.NetworkSettings.IPAddress)
  }

  /** Create a container. */
  async create (): Promise<this> {
    if (this.container) {
      throw new OCIError.ContainerAlreadyCreated()
    }

    // Specify the container
    const opts = this.dockerodeOpts

    this.image.log.creatingContainer(opts.name)

    // Log mounted volumes
    this.log.boundVolumes(opts?.HostConfig?.Binds ?? [])

    // Log exposed ports
    for (const [containerPort, config] of Object.entries(opts?.HostConfig?.PortBindings ?? {})) {
      for (const { HostPort = '(unknown)' } of config as Array<{HostPort: unknown}>) {
        this.log.boundPort(containerPort, HostPort)
      }
    }

    // Create the container
    this.container = await this.dockerode.createContainer(opts)

    // Update the logger tag with the container id
    this.log.label = this.name
      ? `DockerContainer(${this.container.id} ${this.name})`
      : `DockerContainer(${this.container.id})`

    // Display any warnings emitted during container creation
    if (this.warnings) {
      this.log.createdWithWarnings(this.shortId, this.warnings)
    }

    return this
  }

  /** Remove a stopped container. */
  async remove (): Promise<this> {
    if (this.container) await this.container.remove()
    this.container = null
    return this
  }

  /** Start a container. */
  async start (): Promise<this> {
    if (!this.container) await this.create()
    await this.container!.start()
    return this
  }

  /** Get info about a container. */
  inspect () {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    return this.container.inspect()
  }

  /** Immediately terminate a running container. */
  async kill (): Promise<this> {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    const id = this.shortId
    const prettyId = bold(id.slice(0,8))
    if (await this.isRunning) {
      console.log(`Stopping ${prettyId}...`)
      await this.dockerode.getContainer(id).kill()
      console.log(`Stopped ${prettyId}`)
    } else {
      console.warn(`Container already stopped: ${prettyId}`)
    }
    return this
  }

  /** Wait for the container to exit. */
  async wait () {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    const {Error: error, StatusCode: code} = await this.container.wait()
    return { error, code }
  }

  /** Wait for the container logs to emit an expected string. */
  async waitLog (
    expected:    string,
    logFilter?:  (data: string) => boolean,
    thenDetach?: boolean,
  ): Promise<void> {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    const id = this.container.id.slice(0,8)
    const stream = await this.container.logs({ stdout: true, stderr: true, follow: true, })
    if (!stream) {
      throw new OCIError('no stream returned from container')
    }
    const filter = logFilter || (x=>true)
    const logFiltered = (data:string) => {
      if (filter(data)) {
        this.log.debug(data)
      }
    }
    return await waitStream(
      stream as any, expected, thenDetach, logFiltered, this.log
    )
  }

  /** Executes a command in the container.
    * @returns [stdout, stderr] */
  async exec (...command: string[]): Promise<[string, string]> {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }

    // Specify the execution
    const exec = await this.container.exec({
      Cmd: command,
      AttachStdin:  true,
      AttachStdout: true,
      AttachStderr: true,
    })

    // Collect stdout
    let stdout = ''; const stdoutStream = new Transform({
      transform (chunk, encoding, callback) { stdout += chunk; callback() }
    })

    // Collect stderr
    let stderr = ''; const stderrStream = new Transform({
      transform (chunk, encoding, callback) { stderr += chunk; callback() }
    })

    return new Promise(async (resolve, reject)=>{

      // Start the executon
      const stream = await exec.start({hijack: true})

      // Bind this promise to the stream
      stream.on('error', error => reject(error))
      stream.on('end', () => resolve([stdout, stderr]))

      // Demux the stdout/stderr stream into the two output streams
      this.dockerode.modem.demuxStream(stream, stdoutStream, stderrStream)

    })

  }

  /** Save a container as an image. */
  async export (repository?: string, tag?: string) {
    if (!this.container) {
      throw new OCIError.NoContainer()
    }
    const { Id } = await this.container.commit({ repository, tag })
    this.log.log(`Exported snapshot:`, bold(Id))
    return Id
  }

}

/** Follow the output stream from a Dockerode container until it closes. */
export async function follow (
  dockerode: DockerHandle,
  stream:    any,
  callback:  (data: any)=>void
) {
  await new Promise<void>((ok, fail)=>{
    dockerode.modem.followProgress(stream, complete, callback)
    function complete (err: any, _output: any) {
      if (err) return fail(err)
      ok()
    }
  })
}

/* Is this equivalent to follow() and, if so, which implementation to keep? */
export function waitStream (
  stream:     { on: Function, off: Function, destroy: Function },
  expected:   string,
  thenDetach: boolean = true,
  trail:      (data: string) => unknown = ()=>{},
  { log }:    Console = console
): Promise<void> {
  return new Promise((resolve, reject)=>{
    stream.on('error', (error: any) => {
      reject(error)
      stream.off('data', waitStream_onData)
    })
    stream.on('data', waitStream_onData)
    function waitStream_onData (data: any) {
      const dataStr = String(data).trim()
      if (trail) trail(dataStr)
      if (dataStr.indexOf(expected)>-1) {
        log(`Found expected message:`, bold(expected))
        stream.off('data', waitStream_onData)
        if (thenDetach) stream.destroy()
        resolve()
      }
    }
  })
}

export interface ContainerOpts {
  cwd:      string
  env:      Record<string, string>
  exposed:  string[]
  mapped:   Record<string, string>
  readonly: Record<string, string>
  writable: Record<string, string>
  extra:    Record<string, unknown>
  remove:   boolean
}

export type ContainerCommand = string|string[]

export interface ContainerState {
  Image: string,
  State: { Running: boolean },
  NetworkSettings: { IPAddress: string }
}

export interface DockerHandle {
  getImage:         Function
  buildImage:       Function
  getContainer:     Function
  pull:             Function
  createContainer:  Function
  run:              Function
  modem: {
    host?:          string
    socketPath?:    string
    followProgress: Function,
  },
}

/** Defaults to the `DOCKER_HOST` environment variable. */
export const defaultSocketPath = process.env.DOCKER_HOST || '/var/run/docker.sock'

export class ContainerEngine extends Backend {
  async connect (): Promise<ContainerConnection> {
    return new ContainerConnection()
  }
  async getIdentity (): Promise<{}> {
    return {}
  }
  async start () {
    return this
  }
  async pause () {
    return this
  }
  async export () {
  }
  async import () {
  }
}

export class ContainerConnection extends Connection {
  async doGetHeight () {
    return + new Date()
  }
  async doGetBlockInfo () {
    return {}
  }
  async doGetCodeId (contract) {
    return 0
  }
  async doGetCodeHashOfCodeId (contract) {
    return ''
  }
  async doGetCodeHashOfAddress (contract) {
  }
  async doGetCodes () {
  }
  async doGetContractsByCodeId (id) {
  }
  async doGetBalance () {
    return 0
  }
  async doQuery (contract, message) {
    return {}
  }
  async doSend () {
  }
  async doSendMany () {
  }
  async doUpload () {
  }
  async doInstantiate () {
  }
  async doExecute () {
  }
}

export class ContainerImage extends ContractTemplate {
}

export class Container extends ContractInstance {
}