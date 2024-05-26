# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.1 - 2024-05-26

The package repository has moved and it's now reflected in the package metadata; this version contains no functionality changes.

## 2.0.0 - 2022-04-01

### Added

- Introduced `CancellationToken#toAbortSignal()` that will return an `AbortSignal` object that reflects the cancellation state of the token.
- Introduced `CancellationToken#reason` that will reflect the reason for why the cancellation was requested.

### Changed

- Replaced `CancellationToken#canBeCancelled` with `CancellationToken#isCancelable`.
- Cancellation callbacks will be cleaned up after they are executed during a cancellation request.
- Cancellation callbacks that will be executed are determined **before** any are executed. This means attempting to deregister a cancellation callback during a cancellation request will be ignored.
- Updated `CancellationToken#register()` to return the callback function being registered.

## 1.3.0 - 2021-05-16

### Changed

- The UMD version of this module now exposes itself using the name `you-are-cancelled`.

## 1.2.0 - 2021-05-16

### Added

- Introduced ESM and UMD versions of this module, each with an ES5 version for browser environments.

### Changed

- This module now exports minified single file entry points, making this package much more lightweight.

## 1.1.0 - 2021-05-08

### Changed

- Support for Node.js version `10.x.x` has been dropped.

### Fixed

- The TypeScript definition for the `CancellationToken#register()` method now accepts the correct callback type.

## 1.0.1 - 2020-02-02

### Fixed

- The TypeScript definition for the `CancellationToken` is now exposed as a class.
- The TypeScript definitions now include `CancellationToken.None`.

## 1.0.0 - 2020-02-01

The initial public release.
