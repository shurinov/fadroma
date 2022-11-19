# Fadroma Core Specification

This is the core module of the Fadroma dApp framework.

> Run tests with `pnpm test`.
> Measure coverage with `pnpm cov`.[^1]
> Publish with `pnpm ubik`.
> [^1]: Note that stack traces output by `pnpm cov` coverage mode point to line numbers in
>       the compiled code. This is to get correct line numbers in the coverage report.
>       To get the same stack trace with correct line numbers, run `pnpm test`.

This module contains the following features:

## [Error types and event logging](./core-events.spec.ts.md)

```typescript
//import './core-events.spec.ts.md'
```

## [Metadata utitilites](./core-fields.spec.ts.md)

```typescript
//import './core-fields.spec.ts.md'
```

## [Connecting to chains and broadcasting transactions](./core-connect.spec.ts.md)

The innermost core of Fadroma consists of the `Chain` and `Agent`
abstract base classes. They provide a unified base layer for querying
and transacting on append-only transaction-based systems.

The platform packages (`@fadroma/scrt`, etc.) subclass those,
calling into the platform API client library (e.g. `secretjs`)
in order to implement the abstract methods.

```typescript
//import './core-chain.spec.ts.md'
//import './core-agent.spec.ts.md'
//import './core-bundle.spec.ts.md'
```

## [Describing contracts](./core-contract.spec.ts.md)

```typescript
//import './core-client.spec.ts.md'
//import './core-build.spec.ts.md'
//import './core-code.spec.ts.md'
//import './core-upload.spec.ts.md'
//import './core-labels.spec.ts.md'
```

## [Deploying contracts](./core-deploy.spec.ts.md)

```typescript
import './core-contract.spec.ts.md'
//import './core-deploy.spec.ts.md'
```