# You Are Cancelled

[![Available from NPM](https://img.shields.io/npm/v/you-are-cancelled.svg?maxAge=900)](https://www.npmjs.com/package/you-are-cancelled)
[![Built using GitHub Action](https://github.com/lsphillips/YouAreCancelled/actions/workflows/build-and-test.yml/badge.svg?branch=master)](https://github.com/lsphillips/YouAreCancelled/actions)

An implementation of the cooperative cancellation model that is heavily inspired by the [.NET implementation](https://docs.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads).

## Usage

The TL;DR is that there are Cancellation Token Sources where each have a Cancellation Token associated with them. An operation that can be cancelled and spawns one or more async sub-operations would create a Cancellation Token Source and give said sub-operations the resulting Cancellation Token. When interrupted, the operation will request a cancellation using the aforementioned Cancellation Token Source, the associated token will then communicate that cancellation request to all sub-operations allowing them to gracefully abort.

This module can be treated as an ES module:

``` js
import { CancellationTokenSource } from 'you-are-cancelled';
```

This module can also be treated as a CommonJS module:

``` js
const { CancellationTokenSource } = require('you-are-cancelled');
```

### Cancellation Token Sources

An operation that can be cancelled and spawns one or more asynchronous sub-operations would create the Cancellation Token Source:

``` js
const source = new CancellationTokenSource();
```

When the operation needs to be cancelled, you can request a cancellation:

``` js
setTimeout(function ()
{
  source.cancel('Cancelling operation because it took longer than 5 seconds.');

}, 5000);
```

### Cancellation Tokens

The cancellation token is responsible for propagating the cancellation requested by its associative Cancellation Token Source. Every Cancellation Token Source has a unique token associated with it. You will give this token to any asynchronous operation that can be cancelled:

``` js
await getRecordsFromDatabase(source.token);
```

**Important:** Do not pass around the Cancellation Token Source!

#### Reacting to cancellation requests

You can register a callback that will execute when a cancellation has been requested:

``` js
token.register(function (error)
{
  // Clean up...
});
```

**Important:** If a cancellation has already been requested, the callback will be executed immediately.

It is important that you deregister the callback when the operation completes. Otherwise you may have a potential memory leak, or face unexpected errors because a cancellation request will still execute your callback. You can achieve this easily like this:

``` js
const callback = token.register(function ()
{
  // Clean up...
});

try
{
  // Perform operation.
}
catch (error)
{
  // Handle errors.
}
finally
{
  token.deregister(callback);
}
```

#### Handling cancellation requests

The cancellation token is also a `thenable` object, so you can race it against other promises:

``` js
try
{
  await Promise.race([operation, token]);
}
catch (error)
{
  if (error instanceof OperationCancellationError)
  {
    // Was cancelled. Could do some clean up here.
  }
  else
  {
    // Operation error.
  }
}
```

The cancellation token will never resolve; it will only ever be pending or rejected. When a cancellation is requested, the token is rejected with an `OperationCancellationError` with a message that matches the reason provided when said cancellation was requested.

In addition, you can throw an `OperationCancellationError` if a cancellation has already been requested:

``` js
token.throwIfCancellationRequested();
```

#### The Dummy Cancellation Token

When defining an operation that can be cancelled, it is good practice to make the cancellation token optional. The `CancellationToken.None` dummy token can help you with this - you can use it as a default parameter value so your code can always assume it has a cancellation token to work with:

``` js
async function getRecordsFromDatabase(filter, token = CancellationToken.None)
{
  // ...
}
```

#### The token state

Each cancellation token has the following state associated with it:

| Flag                      | Description                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isCancelable`            | Indicates whether the token is capable of being in a cancelled state. Normally this will be `true`, but for the `CancellationToken.None` dummy token this will always be `false`. |
| `isCancellationRequested` | Indicates whether a cancellation has been requested. For the `CancellationToken.None` dummy token this will always be `false`.                                                    |

#### Abort Signals

This module was developed before the [Abort Controller Interface](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) was introduced. To make the migration simpler, or if you simply prefer using this module, a `CancellationToken` can be converted to an `AbortSignal`:

``` js
const signal = token.toAbortSignal();
```

**Important:** This will return `undefined` in a runtime environment where `AbortController` is not yet supported; it is your responsibility to polyfill that interface if you need to.

## Getting started

This module is available through the Node Package Manager (NPM):

``` bash
npm install you-are-cancelled
```

**Please Note:** Versions of Node lower than **v12.0.0** are not supported.

## Development

### Building

You can build UMD and ESM versions of this module that are minified:

``` bash
npm run build
```

### Testing

This module also has a robust test suite:

``` bash
npm test
```

This includes a code quality check using ESLint. Please refer to the `.eslintrc` files to familiar yourself with the rules.

## License

This project is released under the [MIT license](LICENSE.txt).
