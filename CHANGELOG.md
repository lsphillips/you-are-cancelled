# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] (2021-05-16)

### Changed

- The UMD version of this module now exposes itself using the name `you-are-cancelled`.

## [1.2.0] (2021-05-16)

### Changed

- This module now exports minified single file entry points, making this package much more lightweight.

### Added

- Introduced ESM and UMD versions of this module, each with an ES5 version for browser environments.

## [1.1.0] (2021-05-08)

### Fixed

- The TypeScript definition for the `CancellationToken#register()` method now accepts the correct callback type.

### Changed

- Support for Node.js version `10.x.x` has been dropped.

## [1.0.1] (2020-02-02)

### Fixed

- The TypeScript definition for the `CancellationToken` is now exposed as a class.
- The TypeScript definitions now include `CancellationToken.None`.

## [1.0.0] (2020-02-01)

The initial public release.
