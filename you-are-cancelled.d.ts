/**
 * An error that indicates that a cancellation has occurred.
 */
export class OperationCancellationError extends Error
{
	/**
	 * Creates a new error that indicates that a cancellation has occurred.
	 *
	 * @param message An optional explanation as to why the cancellation has occurred.
	 */
	constructor(message? : string);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * A function that will be executed when a cancellation has been requested.
 */
export interface OperationCancellationCallback
{
	(error : OperationCancellationError) : void;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Responsible for propagating the cancellation requested by its associative source.
 */
export class CancellationToken implements PromiseLike<void>
{
	/**
	 * Indicates whether the token is capable of being in a cancelled state.
	 */
	readonly isCancelable : boolean;

	/**
	 * Indicates whether a cancellation has been requested by its associative source.
	 */
	readonly isCancellationRequested : boolean;

	/**
	 * Reflects the reason for why the cancellation was requested.
	 *
	 * If a cancellation has not been requested or a reason was not provided at cancellation then this will be `null`.
	 */
	readonly reason : string | null;

	/**
	 * Registers a callback function to execute when a cancellation has been requested.
	 *
	 * @param callback A function that you want to be executed when a cancellation has been requested.
	 *
	 * @returns The provided callback function.
	 */
	register(callback : OperationCancellationCallback) : OperationCancellationCallback;

	/**
	 * Deregisters a previously registered callback that would execute when a cancellation has been requested.
	 *
	 * @param callback The function that you no longer want to be executed when a cancellation has been requested.
	 */
	deregister(callback : OperationCancellationCallback) : void;

	/**
	 * Throws an `OperationCancellationError` if a cancellation has already been requested.
	 *
	 * This is the same as:
	 *
	 * ``` js
	 * if (token.isCancellationRequested)
	 * {
	 *     throw new OperationCancellationError();
	 * }
	 * ```
	 */
	throwIfCancellationRequested() : void;

	/**
	 * Converts this token into an `AbortSignal` object.
	 *
	 * @returns An `AbortSignal` object that reflects the cancellation state of this token.
	 */
	toAbortSignal() : AbortSignal;

	/**
	 * @inheritdoc
	 */
	then(onFulfilled ?: ((value : void) => any | PromiseLike<any>) | null | undefined, onRejected ?: ((reason : OperationCancellationError) => any | PromiseLike<any>) | null | undefined) : PromiseLike<any>;

	/**
	 * A dummy token that is not capable of being in a cancelled state.
	 */
	static readonly None : CancellationToken;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Responsible for signalling that an operation wants to be cancelled.
 */
export class CancellationTokenSource
{
	/**
	 * Indicates whether a cancellation has been requested.
	 */
	readonly isCancellationRequested : boolean;

	/**
	 * A unique token that is responsible for propagating the cancellation requested by this source.
	 *
	 * This is what you pass around to asynchronous operations that can be cancelled.
	 */
	readonly token : CancellationToken;

	/**
	 * Signals a request for cancellation.
	 *
	 * @param reason An optional explanation as to why the cancellation is being requested.
	 */
	cancel(reason? : string) : void;
}
