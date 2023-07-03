/**
  Fadroma Build
  Copyright (C) 2023 Hack.bg

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
import type Project from './fadroma'
import type { Class, BuilderClass, Buildable, Built, Template } from './fadroma'
import type { Container } from '@hackbg/dock'
import Config from './fadroma-config'
import { Builder, Contract, HEAD, Error as BaseError, Console, bold, colors } from '@fadroma/connect'
import { Engine, Image, Docker, Podman, LineTransformStream } from '@hackbg/dock'
import { hideProperties } from '@hackbg/hide'
import $, {
  Path, OpaqueDirectory, TextFile, BinaryFile, TOMLFile, OpaqueFile
} from '@hackbg/file'
import { default as simpleGit } from 'simple-git'
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname } from 'node:path'
import { homedir } from 'node:os'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
/** The parts of Cargo.toml which the builder needs to be aware of. */
export type CargoTOML = TOMLFile<{ package: { name: string } }>
export { Builder }
/** Can perform builds.
  * Will only perform a build if a contract is not built yet or FADROMA_REBUILD=1 is set. */
export abstract class BuildLocal extends Builder {
  readonly id: string = 'local'
  /** Logger. */
  log = new BuildConsole('build (local)')
  /** The build script. */
  script?:    string
  /** The project workspace. */
  workspace?: string
  /** Whether to skip any `git fetch` calls in the build script. */
  noFetch:    boolean = false
  /** Name of directory where build artifacts are collected. */
  outputDir:  OpaqueDirectory
  /** Version of Rust toolchain to use. */
  toolchain:  string|null = null
  /** Whether the build process should print more detail to the console. */
  verbose:    boolean = false
  /** Whether the build log should be printed only on error, or always */
  quiet:      boolean = false
  /** Default Git reference from which to build sources. */
  revision:   string = HEAD
  /** Owner uid that is set on build artifacts. */
  buildUid?:  number = (process.getuid ? process.getuid() : undefined) // process.env.FADROMA_BUILD_UID
  /** Owner gid that is set on build artifacts. */
  buildGid?:  number = (process.getgid ? process.getgid() : undefined) // process.env.FADROMA_BUILD_GID

  constructor (options: Partial<Config["build"]>) {
    super()
    this.workspace = options.workspace ?? this.workspace
    this.noFetch   = options.noFetch   ?? this.noFetch
    this.toolchain = options.toolchain ?? this.toolchain
    this.verbose   = options.verbose   ?? this.verbose
    this.quiet     = options.quiet     ?? this.quiet
    this.outputDir = $(options.outputDir!).as(OpaqueDirectory)
    if (options.script) this.script = options.script
  }
  /** Check if artifact exists in local artifacts cache directory.
    * If it does, don't rebuild it but return it from there. */
  protected prebuild (outputDir: string, crate?: string, revision: string = HEAD): Built|null {
    if (this.caching && crate) {
      const location = $(outputDir, artifactName(crate, revision))
      if (location.exists()) {
        const artifact = location.url
        const codeHash = this.hashPath(location)
        return { crate, revision, artifact, codeHash }
      }
    }
    return null
  }
  protected populatePrebuilt (buildable: Buildable & Partial<Built>): boolean {
    const { workspace, revision, crate } = buildable
    const prebuilt = this.prebuild(this.outputDir.path, crate, revision)
    if (prebuilt) {
      new BuildConsole(`build ${crate}`).found(prebuilt)
      buildable.artifact = prebuilt.artifact
      buildable.codeHash = prebuilt.codeHash
      return true
    }
    return false
  }
  /** @returns the SHA256 hash of the file at the specified location */
  protected hashPath (location: string|Path) {
    return $(location).as(BinaryFile).sha256
  }
  /** @returns a fully populated Buildable from the original */
  protected resolveSource (source: string|Buildable): Buildable {
    if (typeof source === 'string') source = { crate: source }
    let { crate, workspace = this.workspace, revision = 'HEAD' } = source
    if (!crate) throw new BaseError.Missing.Crate()
    // If the `crate` field contains a slash, this is a crate path and not a crate name.
    // Add the crate path to the workspace path, and clear the crate name.
    if (crate && crate.includes('/')) {
      const fragments = crate.split('/')
      workspace = $(workspace||'', ...crate.split('/')).path
      const { package: { name } } = $(workspace, 'Cargo.toml').as(TOMLFile).load() as any
      crate = name
    }
    return Object.assign(source, { crate, workspace, revision })
  }
}
/** @returns an artifact filename name in the format CRATE@REF.wasm */
export const artifactName = (crate: string, ref: string) =>
  `${crate}@${sanitize(ref)}.wasm`
/** @returns a filename-friendly version of a Git ref */
export const sanitize = (ref: string) =>
  ref.replace(/\//g, '_')
/** @returns an array with duplicate elements removed */
export const distinct = <T> (x: T[]): T[] =>
  [...new Set(x) as any]
/** This builder launches a one-off build container using Dockerode. */
export class BuildContainer extends BuildLocal {
  readonly id = 'Container'
  /** Logger */
  log = new BuildConsole('build (container)')
  /** Used to launch build container. */
  docker: Engine
  /** Tag of the docker image for the build container. */
  image: Image
  /** Path to the dockerfile to build the build container if missing. */
  dockerfile: string
  /** Used to authenticate Git in build container. */
  sshAuthSocket?: string // process.env.SSH_AUTH_SOCK
  /** Used to fix Cargo when Fadroma is included as a Git submodule */
  workspaceManifest?: string // process.env.FADROMA_BUILD_WORKSPACE_MANIFEST
  /** Used for historical builds. */
  preferredRemote: string = 'origin' // process.env.FADROMA_PREFERRED_REMOTE

  constructor (opts: Partial<Config["build"] & { docker?: Engine }> = {}) {
    super(opts)
    const { docker, dockerSocket, dockerImage } = opts
    // Set up Docker API handle
    const Containers = opts.podman ? Podman : Docker
    if (dockerSocket) {
      this.docker = new Containers.Engine(dockerSocket)
    } else if (docker) {
      this.docker = docker
    } else {
      this.docker = new Containers.Engine()
    }
    if ((dockerImage as unknown) instanceof Containers.Image) {
      this.image = opts.dockerImage as unknown as Image
    } else if (opts.dockerImage) {
      this.image = this.docker.image(opts.dockerImage)
    } else {
      this.image = this.docker.image('ghcr.io/hackbg/fadroma:master')
    }
    // Set up Docker image
    this.dockerfile ??= opts.dockerfile!
    this.script ??= opts.script!
    hideProperties(this,
      'log', 'name', 'description', 'timestamp',
      'commandTree', 'currentCommand',
      'args', 'task', 'before')
  }
  get [Symbol.toStringTag]() {
    return `${this.image?.name??'-'} -> ${this.outputDir?.shortPath??'-'}`
  }
  /** Build a Source into a Template. */
  async build (contract: Buildable): Promise<Built> {
    const [result] = await this.buildMany([contract])
    return result
  }
  /** This implementation groups the passed source by workspace and ref,
    * in order to launch one build container per workspace/ref combination
    * and have it build all the crates from that combination in sequence,
    * reusing the container's internal intermediate build cache. */
  async buildMany (buildables: (string|(Buildable & Partial<Built>))[]): Promise<Built[]> {
    // This copies the argument because we'll mutate its contents anyway
    buildables = buildables.map(source=>this.resolveSource(source))
    // Batch together buildables from the same repo+commit
    const [workspaces, revisions] = this.collectBuildBatches(buildables as Buildable[])
    // For each repository/revision pair, build the buildables from it.
    for (const path of workspaces)
      for (const revision of revisions)
        await this.buildBatch(buildables as Buildable[], path, revision)
    return buildables as Built[]
  }
  /** Go over the list of buildables, filtering out the ones that are already built,
    * and collecting the source repositories and revisions. This will allow for
    * multiple crates from the same source checkout to be passed to a single build command. */
  protected collectBuildBatches (buildables: Buildable[]) {
    const workspaces = new Set<string>()
    const revisions  = new Set<string>()
    for (let id in buildables) {
      // Contracts passed as strins are converted to object here
      const source = buildables[id] as Buildable & Partial<Built>
      source.workspace ??= this.workspace
      source.revision  ??= 'HEAD'
      // If the source is already built, don't build it again
      if (!this.populatePrebuilt(source)) {
        this.log.one(source)
        // Set ourselves as the source's builder
        source.builder = this as unknown as Builder
        // Add the source repository of the contract to the list of buildables to build
        workspaces.add(source.workspace!)
        revisions.add(source.revision!)
      }
    }
    return [workspaces, revisions]
  }
  protected async buildBatch (buildables: Buildable[], path: string, revision: string) {
    this.log.log('Building from', path, '@', revision)
    // Which directory to mount into the build container? By default,
    // this is the root of the workspace. But if the workspace is not
    // at the root of the Git repo (e.g. when using Git submodules),
    // a parent directory may need to be mounted to get the full
    // Git history.
    let mounted = $(path)
    if (this.verbose) this.log.workspace(mounted, revision)
    // If we're building from history, update `mounted` to make sure
    // that the full contents of the Git repo will be mounted in the
    // build container.
    if (revision !== HEAD) {
      const gitDir = getGitDir({ workspace: path })
      mounted = gitDir.rootRepo
      const remote = process.env.FADROMA_PREFERRED_REMOTE || 'origin'
      try {
        await this.fetch(gitDir, remote)
      } catch (e) {
        this.log.fetchFailed(remote, e)
      }
    }
    // Match each crate from the current repo/ref pair
    // with its index in the originally passed list of buildables.
    const crates: [number, string][] = []
    for (let index = 0; index < buildables.length; index++) {
      const source = buildables[index] as Buildable & Partial<Built>
      if (source.workspace === path && source.revision === revision) {
        crates.push([index, source.crate!])
      }
    }
    // Build the crates from each same workspace/revision pair and collect the results.
    // sequentially in the same container.
    // Collect the templates built by the container
    const results = await this.runBuildContainer(
      mounted.path,
      mounted.relative(path),
      revision,
      crates,
      (revision !== HEAD)
        ? (gitDir=>gitDir.isSubmodule?gitDir.submoduleDir:'')(getGitDir({ workspace: path }))
        : ''
    )
    // Using the previously collected indices,
    // populate the values in each of the passed buildables.
    for (const index in results) {
      if (!results[index]) continue
      const contract = buildables[index] as Buildable & Partial<Built>
      contract.artifact = results[index]!.artifact
      contract.codeHash = results[index]!.codeHash
    }
  }
  protected async fetch (gitDir: Path, remote: string) {
    await simpleGit(gitDir.path).fetch(remote)
  }
  protected async runBuildContainer (
    root:      string,
    subdir:    string,
    revision:  string,
    crates:    [number, string][],
    gitSubdir: string = '',
    outputDir: string = this.outputDir.path
  ): Promise<(Built|null)[]> {
    // Default to building from working tree.
    revision ??= HEAD
    // Create output directory as user if it does not exist
    $(outputDir).as(OpaqueDirectory).make()
    // Collect crates to build
    const [templates, shouldBuild] = this.collectCrates(outputDir, revision, crates)
    // If there are no templates to build, this means everything was cached and we're done.
    if (Object.keys(shouldBuild).length === 0) return templates as Built[]
    // Define the mounts and environment variables of the build container
    if (!this.script) throw new BuildError.ScriptNotSet()
    const buildScript = $(`/`, $(this.script).name).path
    const safeRef = sanitize(revision)
    const knownHosts = $(homedir()).in('.ssh').at('known_hosts')
    const etcKnownHosts = $(`/etc/ssh/ssh_known_hosts`)
    const readonly = {
      // The script that will run in the container
      [this.script]: buildScript,
      // Root directory of repository, containing real .git directory
      [$(root).path]: `/src`,
      // For non-interactively fetching submodules over SSH, we need to propagate known_hosts
      ...(knownHosts.isFile()    ? { [knownHosts.path]:     '/root/.ssh/known_hosts'   } : {}),
      ...(etcKnownHosts.isFile() ? { [etcKnownHosts.path] : '/etc/ssh/ssh_known_hosts' } : {}),
    }
    // For fetching from private repos, we need to give the container access to ssh-agent
    if (this.sshAuthSocket) readonly[this.sshAuthSocket] = '/ssh_agent_socket'
    const writable = {
      // Output path for final artifacts
      [outputDir]:                  `/output`,
      // Persist cache to make future rebuilds faster. May be unneccessary.
      //[`project_cache_${safeRef}`]: `/tmp/target`,
      [`cargo_cache_${safeRef}`]:   `/usr/local/cargo`
    }
    // Since Fadroma can be included as a Git submodule, but
    // Cargo doesn't support nested workspaces, Fadroma's
    // workpace root manifest is renamed to _Cargo.toml.
    // Here we can mount it under its proper name
    // if building the example contracts from Fadroma.
    if (this.workspaceManifest) {
      if (revision !== HEAD) throw new BuildError.NoHistoricalManifest()
      writable[$(root).path] = readonly[$(root).path]
      delete readonly[$(root).path]
      readonly[$(this.workspaceManifest).path] = `/src/Cargo.toml`
    }
    // Pre-populate the list of expected artifacts.
    const outputWasms: Array<string|null> = [...new Array(crates.length)].map(()=>null)
    for (const [crate, index] of Object.entries(shouldBuild)) {
      outputWasms[index] = $(outputDir, artifactName(crate, safeRef)).path
    }
    // Pass the compacted list of crates to build into the container
    const cratesToBuild = Object.keys(shouldBuild)
    const command = [ 'node', buildScript, 'phase1', revision, ...cratesToBuild ]
    const buildEnv = this.getEnv(subdir, gitSubdir)
    const options = this.getOptions(subdir, gitSubdir, readonly, writable)
    let buildLogs = ''
    const logs = this.getLogStream(revision, (data) => {buildLogs += data})
    // Run the build container
    this.log.container(root, revision, cratesToBuild)
    const name = `fadroma-build-${randomBytes(3).toString('hex')}`
    const buildContainer = await this.image.run(name, options, command, '/usr/bin/env', logs)
    process.once('beforeExit', () => this.killBuildContainer(buildContainer))
    const {error, code} = await buildContainer.wait()
    // Throw error if launching the container failed
    if (error) {
      throw new BuildError(`[@hackbg/fadroma] Docker error: ${error}`)
    }
    // Throw error if the build failed
    if (code !== 0) this.buildFailed(cratesToBuild, code, buildLogs)
    // Return a sparse array of the resulting artifacts
    return outputWasms.map(x=>this.locationToContract(x) as Built)
  }
  protected collectCrates (outputDir: string, revision: string, crates: [number, string][]) {
    // Output slots. Indices should correspond to those of the input to buildMany
    const templates: Array<Built|null> = crates.map(()=>null)
    // Whether any crates should be built, and at what indices they are in the input and output.
    const shouldBuild: Record<string, number> = {}
    // Collect cached templates. If any are missing from the cache mark them as buildable.
    for (const [index, crate] of crates) {
      const prebuilt = this.prebuild(outputDir, crate, revision)
      if (prebuilt) {
        //const location = $(prebuilt.artifact!).shortPath
        //console.info('Exists, not rebuilding:', bold($(location).shortPath))
        templates[index] = prebuilt
      } else {
        shouldBuild[crate] = index
      }
    }
    return [ templates, shouldBuild ]
  }
  protected getOptions (
    subdir:    string,
    gitSubdir: string,
    readonly:  Record<string, string>,
    writable:  Record<string, string>,
  ) {
    const remove = true
    const cwd    = '/src'
    const env    = this.getEnv(subdir, gitSubdir)
    const extra  = { Tty: true, AttachStdin: true }
    return { remove, readonly, writable, cwd, env, extra }
  }
  protected getEnv (subdir: string, gitSubdir: string): Record<string, string> {
    const buildEnv = {
      // Vars used by the build script itself are prefixed with underscore:
      _BUILD_UID:  String(this.buildUid),
      _BUILD_GID:  String(this.buildGid),
      _GIT_REMOTE: this.preferredRemote,
      _GIT_SUBDIR: gitSubdir,
      _SUBDIR:     subdir,
      _NO_FETCH:   String(this.noFetch),
      _VERBOSE:    String(this.verbose),
      // Vars used by the tools invoked by the build script are left as is:
      LOCKED: '',/*'--locked'*/
      CARGO_HTTP_TIMEOUT: '240',
      CARGO_NET_GIT_FETCH_WITH_CLI: 'true',
      GIT_PAGER: 'cat',
      GIT_TERMINAL_PROMPT: '0',
      SSH_AUTH_SOCK: '/ssh_agent_socket',
      TERM: process?.env?.TERM,
    }
    // Remove keys whose value is `undefined` from `buildEnv`
    for (const key of Object.keys(buildEnv)) {
      if (buildEnv[key as keyof typeof buildEnv] === undefined) {
        delete buildEnv[key as keyof typeof buildEnv]
      }
    }
    return buildEnv as Record<string, string>
  }
  protected getLogStream (revision: string, cb: (data: string)=>void) {
    // This stream collects the output from the build container, i.e. the build logs.
    const buildLogStream = new LineTransformStream((!this.quiet)
      // In normal and verbose mode, build logs are printed to the console in real time,
      // with an addition prefix to show what is being built.
      ? (line:string)=>`${bold('BUILD')} @ ${revision} │ ${line}`
      // In quiet mode the logs are collected into a string as-is,
      // and are only printed if the build fails.
      : (line:string)=>line)
    // In quiet mode, build logs are collected in a string
    // In non-quiet mode, build logs are piped directly to the console;
    if (this.quiet) { buildLogStream.on('data', cb) } else { buildLogStream.pipe(process.stdout) }
    return buildLogStream
  }
  protected buildFailed (crates: string[], code: string|number, logs: string) {
    const crateList = crates.join(' ')
    this.log
      .log(logs)
      .error('Build of crates:', bold(crateList), 'exited with status', bold(String(code)))
    throw new BuildError(`[@hackbg/fadroma] Build of crates: "${crateList}" exited with status ${code}`)
  }
  protected locationToContract (location: any) {
    if (location === null) return null
    const artifact = $(location).url
    const codeHash = this.hashPath(location)
    return new Contract({ artifact, codeHash })
  }
  protected async killBuildContainer (buildContainer: Container) {
    if (this.verbose) this.log.log('killing build container', bold(buildContainer.id))
    try {
      await buildContainer.kill()
      this.log.log('killed build container', bold(buildContainer.id))
    } catch (e) {
      if (!e.statusCode) this.log.error(e)
      else if (e.statusCode === 404) {}
      else if (this.verbose) this.log.warn(
        'failed to kill build container', e.statusCode, `(${e.reason})`
      )
    }
  }
}
/** This build mode looks for a Rust toolchain in the same environment
  * as the one in which the script is running, i.e. no build container. */
export class BuildRaw extends BuildLocal {
  readonly id = 'Raw'
  /** Logging handle. */
  log = new BuildConsole('build (raw)')
  /** Node.js runtime that runs the build subprocess.
    * Defaults to the same one that is running this script. */
  runtime = process.argv[0]
  /** Build multiple Sources. */
  async buildMany (inputs: Buildable[]): Promise<Built[]> {
    const templates: Built[] = []
    for (const source of inputs) templates.push(await this.build(source))
    return templates
  }
  /** Build a Source into a Template */
  async build (source: Buildable): Promise<Built> {
    source.workspace ??= this.workspace
    source.revision  ??= HEAD
    const { workspace, revision, crate } = source
    if (!crate && !workspace) throw new BuildError.Missing.Crate()
    const { env, tmpGit, tmpBuild } = this.getEnvAndTemp(source, workspace, revision)
    // Run the build script as a subprocess
    const location = await this.runBuild(source, env)
    // If this was a non-HEAD build, remove the temporary Git dir used to do the checkout
    if (tmpGit && tmpGit.exists()) tmpGit.delete()
    if (tmpBuild && tmpBuild.exists()) tmpBuild.delete()
    // Create an artifact for the build result
    this.log.sub(source.crate).log('built', bold(location.shortPath))
    const artifact = pathToFileURL(location.path)
    const codeHash = this.hashPath(location.path)
    return Object.assign(source, { artifact, codeHash })
  }
  protected getEnvAndTemp (source: Buildable, workspace?: string, revision?: string) {
    // Temporary dirs used for checkouts of non-HEAD builds
    let tmpGit:   Path|null = null
    let tmpBuild: Path|null = null
    // Most of the parameters are passed to the build script
    // by way of environment variables.
    const env = {
      _BUILD_GID: String(this.buildUid),
      _BUILD_UID: String(this.buildGid),
      _OUTPUT:    $(workspace||process.cwd()).in('wasm').path,
      _REGISTRY:  '',
      _TOOLCHAIN: this.toolchain,
    }
    if ((revision ?? HEAD) !== HEAD) {
      const gitDir = getGitDir(source)
      // Provide the build script with the config values that ar
      // needed to make a temporary checkout of another commit
      if (!gitDir?.present) throw new BuildError.NoGitDir({ source })
      // Create a temporary Git directory. The build script will copy the Git history
      // and modify the refs in order to be able to do a fresh checkout with submodules
      tmpGit   = $.tmpDir('fadroma-git-')
      tmpBuild = $.tmpDir('fadroma-build-')
      Object.assign(env, {
        _GIT_ROOT:   gitDir.path,
        _GIT_SUBDIR: gitDir.isSubmodule ? gitDir.submoduleDir : '',
        _NO_FETCH:   this.noFetch,
        _TMP_BUILD:  tmpBuild.path,
        _TMP_GIT:    tmpGit.path,
      })
    }
    return {env, tmpGit, tmpBuild}
  }
  /** Overridable. */
  protected spawn (...args: Parameters<typeof spawn>) {
    return spawn(...args)
  }
  /** Overridable. */
  protected getGitDir (...args: Parameters<typeof getGitDir>) {
    return getGitDir(...args)
  }
  protected runBuild (source: Buildable, env: { _OUTPUT: string }): Promise<Path> {
    const { crate, workspace, revision } = this.resolveSource(source)
    return new Promise((resolve, reject)=>this.spawn(
      this.runtime!, [ this.script!, 'phase1', source.revision||HEAD, crate ],
      { cwd: workspace, env: { ...process.env, ...env }, stdio: 'inherit' } as any
    ).on('exit', (code: number, signal: any) => {
      const build = `Build of ${crate} from ${$(workspace!).shortPath} @ ${revision}`
      if (code === 0) {
        resolve($(env._OUTPUT, artifactName(crate, sanitize(revision||'HEAD'))))
      } else if (code !== null) {
        const message = `${build} exited with code ${code}`
        this.log.error(message)
        throw Object.assign(new BuildError(message), { source, code })
      } else if (signal !== null) {
        const message = `${build} exited by signal ${signal}`
        this.log.warn(message)
      } else {
        throw new BuildError('Unreachable')
      }
    }))
  }
}
// Expose builder implementations via the Builder.variants static property
Object.assign(Builder.variants, {
  'container': BuildContainer, 'Container': BuildContainer,
  'raw': BuildRaw, 'Raw': BuildRaw
})
// Try to determine where the .git directory is located
export function getGitDir (template: Partial<Template<any>> = {}): DotGit {
  const { workspace } = template || {}
  if (!workspace) throw new BuildError("No workspace specified; can't find gitDir")
  return new DotGit(workspace)
}
/** Represents the real location of the Git data directory.
  * - In standalone repos this is `.git/`
  * - If the contracts workspace repository is a submodule,
  *   `.git` will be a file containing e.g. "gitdir: ../.git/modules/something" */
export class DotGit extends Path {
  log = new Console('@hackbg/fadroma: DotGit')
  /** Whether a .git is present */
  readonly present:     boolean
  /** Whether the workspace's repository is a submodule and
    * its .git is a pointer to the parent's .git/modules */
  readonly isSubmodule: boolean = false

  constructor (base: string|URL, ...fragments: string[]) {
    if (base instanceof URL) base = fileURLToPath(base)
    super(base, ...fragments, '.git')
    if (!this.exists()) {
      // If .git does not exist, it is not possible to build past commits
      this.log.warn(bold(this.shortPath), 'does not exist')
      this.present = false
    } else if (this.isFile()) {
      // If .git is a file, the workspace is contained in a submodule
      const gitPointer = this.as(TextFile).load().trim()
      const prefix = 'gitdir:'
      if (gitPointer.startsWith(prefix)) {
        // If .git contains a pointer to the actual git directory,
        // building past commits is possible.
        const gitRel = gitPointer.slice(prefix.length).trim()
        const gitPath = $(this.parent, gitRel).path
        const gitRoot = $(gitPath)
        //this.log.info(bold(this.shortPath), 'is a file, pointing to', bold(gitRoot.shortPath))
        this.path = gitRoot.path
        this.present = true
        this.isSubmodule = true
      } else {
        // Otherwise, who knows?
        this.log.info(bold(this.shortPath), 'is an unknown file.')
        this.present = false
      }
    } else if (this.isDirectory()) {
      // If .git is a directory, this workspace is not in a submodule
      // and it is easy to build past commits
      this.present = true
    } else {
      // Otherwise, who knows?
      this.log.warn(bold(this.shortPath), `is not a file or directory`)
      this.present = false
    }
  }
  get rootRepo (): Path {
    return $(this.path.split(DotGit.rootRepoRE)[0])
  }
  get submoduleDir (): string {
    return this.path.split(DotGit.rootRepoRE)[1]
  }
  /* Matches "/.git" or "/.git/" */
  static rootRepoRE = new RegExp(`${Path.separator}.git${Path.separator}?`)
}
/** Represents a crate containing a contract. */
export class ContractCrate {
  constructor (
    readonly project: Project,
    /** Name of crate */
    readonly name: string,
    /** Features of the 'fadroma' dependency to enable. */
    readonly fadromaFeatures: string[] = [ 'scrt' ],
    /** Root directory of crate. */
    readonly dir: OpaqueDirectory = project.dirs.src.in(name).as(OpaqueDirectory),
    /** Crate manifest. */
    readonly cargoToml: TextFile = dir.at('Cargo.toml').as(TextFile),
    /** Directory containing crate sources. */
    readonly src: OpaqueDirectory = dir.in('src').as(OpaqueDirectory),
    /** Root module of Rust crate. */
    readonly libRs: TextFile = src.at('lib.rs').as(TextFile)
  ) {}
  create () {
    this.cargoToml.save([
      `[package]`,
      `name = "${this.name}"`,
      `version = "0.0.0"`,
      `edition = "2021"`,
      `authors = []`,
      `keywords = ["fadroma"]`,
      `description = ""`,
      `readme = "README.md"`, ``,
      `[lib]`, `crate-type = ["cdylib", "rlib"]`, ``,
      `[dependencies]`,
      `fadroma = { version = "^0.8.7", features = ${JSON.stringify(this.fadromaFeatures)} }`,
      `serde = { version = "1.0.114", default-features = false, features = ["derive"] }`
    ].join('\n'))
    this.src.make()
    this.libRs.save([
      `//! Created by [Fadroma](https://fadroma.tech).`, ``,
      `#[fadroma::dsl::contract] pub mod contract {`,
      `    use fadroma::{*, dsl::*, prelude::*};`,
      `    impl Contract {`,
      `        #[init(entry_wasm)]`,
      `        pub fn new () -> Result<Response, StdError> {`,
      `            Ok(Response::default())`,
      `        }`,
      `        // #[execute]`,
      `        // pub fn my_tx_1 (arg1: String, arg2: Uint128) -> Result<Response, StdError> {`,
      `        //     Ok(Response::default())`,
      `        // }`,
      `        // #[execute]`,
      `        // pub fn my_tx_2 (arg1: String, arg2: Uint128) -> Result<Response, StdError> {`,
      `        //     Ok(Response::default())`,
      `        // }`,
      `        // #[query]`,
      `        // pub fn my_query_1 (arg1: String, arg2: Uint128) -> Result<(), StdError> {`,
      `        //     Ok(())`, '',
      `        // }`,
      `        // #[query]`,
      `        // pub fn my_query_2 (arg1: String, arg2: Uint128) -> Result<(), StdError> {`,
      `        //     Ok(())`, '',
      `        // }`,
      `    }`,
      `}`,
    ].join('\n'))
  }
}
/** Build console. */
class BuildConsole extends Console {
  one = ({ crate = '(unknown)', revision = 'HEAD' }: Partial<Template<any>>) => this.log(
    'Building', bold(crate), ...(revision === 'HEAD')
      ? ['from working tree']
      : ['from Git reference', bold(revision)])
  many = (buildables: Template<any>[]) =>
    buildables.forEach(source=>this.one(source))
  found = ({ artifact }: Built) =>
    this.log(`found at ${bold($(artifact!).shortPath)}`)
  workspace = (mounted: Path|string, ref: string = HEAD) => this.log(
    `building from workspace:`, bold(`${$(mounted).shortPath}/`),
    `@`, bold(ref))
  container = (root: string|Path, revision: string, cratesToBuild: string[]) =>
    this.log(
      `started building from ${bold($(root).shortPath)} @ ${bold(revision)}:`,
      cratesToBuild.map(x=>bold(x)).join(', ')
    )
  fetchFailed = (remote: string, e: any) => {
    this.warn(
      `Git fetch from remote ${remote} failed. Build may fail or produce an outdated result.`
    )
    this.warn(e)
  }
}
/** Build error. */
export class BuildError extends BaseError {
  static ScriptNotSet = this.define('ScriptNotSet',
    ()=>'build script not set')
  static NoHistoricalManifest = this.define('NoHistoricalManifest',
    ()=>'the workspace manifest option can only be used when building from working tree')
  static NoGitDir = this.define('NoGitDir',
    (args)=>'could not find .git directory',
    (err, args)=>Object.assign(err, args||{}))
}
